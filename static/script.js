const { createApp, ref, computed } = Vue;

createApp({
    setup() {
        const results = ref([]);
        const loading = ref(false);
        const error = ref(null);
        const isDragging = ref(false);
        const currentFilter = ref('all');
        const sortOrder = ref(null); // null -> 'desc' -> 'asc'
        const fileInput = ref(null);
        const folderInput = ref(null);
        const uploadProgress = ref({
            current: 0,
            total: 0,
            currentFiles: 0,
            totalFiles: 0,
            preprocessing: false,
            preprocessingCurrent: 0,
            preprocessingTotal: 0
        });

        // 批次上传配置
        const BATCH_SIZE = 150;
        const FILTER_CHUNK_SIZE = 1000; // 每批过滤的文件数

        const filterTypes = [
            { label: '全部', value: 'all' },
            { label: 'Markdown', value: '.md' },
            { label: 'Text', value: '.txt' },
            { label: 'PDF', value: '.pdf' },
            { label: 'Word', value: '.docx' }
        ];

        const filteredResults = computed(() => {
            let res = results.value;
            if (currentFilter.value !== 'all') {
                res = res.filter(file => file.file_type === currentFilter.value);
            }

            if (sortOrder.value) {
                res = [...res].sort((a, b) => {
                    if (sortOrder.value === 'asc') {
                        return a.char_count - b.char_count;
                    } else {
                        return b.char_count - a.char_count;
                    }
                });
            }

            return res;
        });

        const toggleSort = () => {
            if (sortOrder.value === null) {
                sortOrder.value = 'desc';
            } else if (sortOrder.value === 'desc') {
                sortOrder.value = 'asc';
            } else {
                sortOrder.value = null;
            }
        };

        const totalWords = computed(() => {
            return filteredResults.value.reduce((sum, file) => sum + file.char_count, 0);
        });

        const triggerFileInput = () => {
            fileInput.value.click();
        };

        const triggerFolderInput = () => {
            folderInput.value.click();
        };

        // 异步过滤文件 - 分批处理避免阻塞UI
        const filterFilesAsync = async (fileList) => {
            const supportedExtensions = new Set(['.docx', '.pdf', '.txt', '.md']);
            const allFiles = Array.isArray(fileList) ? fileList : Array.from(fileList);
            const validFiles = [];

            const totalFiles = allFiles.length;
            const chunks = Math.ceil(totalFiles / FILTER_CHUNK_SIZE);

            uploadProgress.value.preprocessing = true;
            uploadProgress.value.preprocessingTotal = totalFiles;
            uploadProgress.value.preprocessingCurrent = 0;

            for (let i = 0; i < chunks; i++) {
                const start = i * FILTER_CHUNK_SIZE;
                const end = Math.min(start + FILTER_CHUNK_SIZE, totalFiles);

                // 处理当前批次
                for (let j = start; j < end; j++) {
                    const file = allFiles[j];
                    const fileName = file.name.toLowerCase();
                    const ext = '.' + fileName.split('.').pop();

                    if (supportedExtensions.has(ext) && !file.name.startsWith('~$')) {
                        validFiles.push(file);
                    }
                }

                uploadProgress.value.preprocessingCurrent = end;

                // 让浏览器有机会更新UI
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            uploadProgress.value.preprocessing = false;
            return validFiles;
        };

        const handleFileSelect = async (event) => {
            const files = event.target.files;

            // 立即显示loading状态
            loading.value = true;
            error.value = null;

            // 让Vue先更新DOM
            await new Promise(resolve => setTimeout(resolve, 0));

            // 异步过滤文件
            const validFiles = await filterFilesAsync(files);

            await uploadFiles(validFiles);

            // Reset inputs to allow selecting the same file again
            event.target.value = '';
        };

        const handleDrop = async (event) => {
            isDragging.value = false;

            // 立即显示loading状态
            loading.value = true;
            error.value = null;

            // 让Vue先更新DOM
            await new Promise(resolve => setTimeout(resolve, 0));

            const items = event.dataTransfer.items;

            if (items) {
                const files = [];
                const promises = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.kind === 'file') {
                        const entry = item.webkitGetAsEntry();
                        if (entry) {
                            promises.push(scanEntry(entry, files));
                        }
                    }
                }
                await Promise.all(promises);

                // 异步过滤文件
                const validFiles = await filterFilesAsync(files);
                await uploadFiles(validFiles);
            } else {
                // 异步过滤文件
                const validFiles = await filterFilesAsync(event.dataTransfer.files);
                await uploadFiles(validFiles);
            }
        };

        const scanEntry = async (entry, fileList) => {
            if (entry.isFile) {
                return new Promise((resolve) => {
                    entry.file((file) => {
                        fileList.push(file);
                        resolve();
                    });
                });
            } else if (entry.isDirectory) {
                const reader = entry.createReader();
                const readEntries = async () => {
                    const entries = await new Promise((resolve) => {
                        reader.readEntries((entries) => resolve(entries));
                    });

                    if (entries.length > 0) {
                        await Promise.all(entries.map(e => scanEntry(e, fileList)));
                        await readEntries();
                    }
                };
                await readEntries();
            }
        };

        const uploadFiles = async (validFiles) => {
            if (!validFiles || validFiles.length === 0) {
                error.value = '请选择包含支持格式 (.docx, .pdf, .txt, .md) 的文件';
                loading.value = false;
                return;
            }

            // loading已经在handleFileSelect/handleDrop中设置
            results.value = []; // 清空之前的结果

            try {
                // 计算批次数量
                const totalBatches = Math.ceil(validFiles.length / BATCH_SIZE);
                uploadProgress.value = {
                    current: 0,
                    total: totalBatches,
                    currentFiles: 0,
                    totalFiles: validFiles.length
                };

                // 分批上传
                for (let i = 0; i < totalBatches; i++) {
                    const start = i * BATCH_SIZE;
                    const end = Math.min(start + BATCH_SIZE, validFiles.length);
                    const batch = validFiles.slice(start, end);

                    uploadProgress.value.current = i + 1;

                    // 创建当前批次的 FormData
                    const formData = new FormData();
                    batch.forEach(file => {
                        formData.append('files[]', file);
                    });

                    // 上传当前批次
                    const response = await fetch('/api/analyze_upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || `第 ${i + 1} 批次上传失败`);
                    }

                    // 合并结果
                    results.value = [...results.value, ...data.results];
                    uploadProgress.value.currentFiles = results.value.length;
                }

            } catch (err) {
                error.value = err.message;
                // 即使部分失败，也保留已成功上传的结果
            } finally {
                loading.value = false;
                uploadProgress.value = {
                    current: 0,
                    total: 0,
                    currentFiles: 0,
                    totalFiles: 0,
                    preprocessing: false,
                    preprocessingCurrent: 0,
                    preprocessingTotal: 0
                };
            }
        };

        const exportExcel = async () => {
            if (filteredResults.value.length === 0) return;

            try {
                const response = await fetch('/api/export/excel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ results: filteredResults.value })
                });

                if (!response.ok) {
                    throw new Error('导出 Excel 失败');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '字数统计报告.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();

            } catch (err) {
                error.value = err.message;
            }
        };

        const exportPDF = async () => {
            if (filteredResults.value.length === 0) return;

            try {
                const response = await fetch('/api/export/pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ results: filteredResults.value })
                });

                if (!response.ok) {
                    throw new Error('导出 PDF 失败');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '字数统计报告.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();

            } catch (err) {
                error.value = err.message;
            }
        };

        const reset = () => {
            results.value = [];
            error.value = null;
            currentFilter.value = 'all';
        };

        const getFileTypeClass = (type) => {
            switch (type) {
                case '.docx': return 'bg-blue-100 text-blue-700';
                case '.pdf': return 'bg-red-100 text-red-700';
                case '.txt': return 'bg-gray-100 text-gray-700';
                case '.md': return 'bg-indigo-100 text-indigo-700';
                default: return 'bg-gray-100 text-gray-700';
            }
        };

        return {
            results,
            loading,
            error,
            isDragging,
            currentFilter,
            sortOrder,
            toggleSort,
            filterTypes,
            filteredResults,
            totalWords,
            fileInput,
            folderInput,
            triggerFileInput,
            triggerFolderInput,
            handleFileSelect,
            handleDrop,
            exportExcel,
            exportPDF,
            reset,
            getFileTypeClass,
            uploadProgress
        };
    }
}).mount('#app');
