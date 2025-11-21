document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    const errorMsg = document.getElementById('errorMsg');
    const errorText = document.getElementById('errorText');
    const resultSection = document.getElementById('resultSection');
    const resultTableBody = document.getElementById('resultTableBody');

    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const folderInputHidden = document.getElementById('folderInputBtn');
    const uploadSpinner = document.getElementById('uploadSpinner');
    const dropContent = document.querySelector('.drop-content');

    let currentResults = [];

    // --- Drag & Drop Logic ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // --- Click to Open Folder Picker ---
    dropZone.addEventListener('click', () => {
        folderInputHidden.click();
    });

    folderInputHidden.addEventListener('change', (e) => handleFiles(e.target.files));

    async function handleFiles(fileList) {
        if (!fileList || fileList.length === 0) return;

        const formData = new FormData();
        let hasDocx = false;

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.name.toLowerCase().endsWith('.docx') && !file.name.startsWith('~$')) {
                formData.append('files[]', file);
                hasDocx = true;
            }
        }

        if (!hasDocx) {
            showError('请选择包含 .docx 文件的文件夹或文件');
            return;
        }

        setUploading(true);
        hideError();
        resultSection.classList.add('hidden');

        try {
            const response = await fetch('/api/analyze_upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '发生未知错误');
            }

            currentResults = data.results;
            renderTable(data.results);
            resultSection.classList.remove('hidden');

        } catch (err) {
            showError(err.message);
        } finally {
            setUploading(false);
            // Reset input
            folderInputHidden.value = '';
        }
    }

    function setUploading(isUploading) {
        if (isUploading) {
            dropContent.classList.add('hidden');
            uploadSpinner.classList.remove('hidden');
            dropZone.style.pointerEvents = 'none';
        } else {
            dropContent.classList.remove('hidden');
            uploadSpinner.classList.add('hidden');
            dropZone.style.pointerEvents = 'auto';
        }
    }

    // --- Manual Path Logic ---
    // Removed as per user request


    // --- Export Logic ---
    exportBtn.addEventListener('click', async () => {
        if (currentResults.length === 0) return;

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ results: currentResults })
            });

            if (!response.ok) {
                throw new Error('导出失败');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '字数统计结果.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (err) {
            showError(err.message);
        }
    });

    function renderTable(results) {
        resultTableBody.innerHTML = '';
        results.forEach(row => {
            const tr = document.createElement('tr');
            const statusClass = row.status === '成功' ? 'status-success' : 'status-error';
            tr.innerHTML = `
                <td>${escapeHtml(row.filename)}</td>
                <td>${row.char_count}</td>
                <td><span class="${statusClass}">${row.status}</span></td>
            `;
            resultTableBody.appendChild(tr);
        });
    }

    function showError(msg) {
        errorText.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.classList.add('hidden');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
