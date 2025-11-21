#!/usr/bin/env python3
# 使用 weasyprint 或其它方式创建 PDF，如果没有就用 cupsfilter
import subprocess
import os

# 创建一个 HTML 文件
html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test PDF</title>
</head>
<body>
    <p>This is a PDF test file.</p>
    <p>这是PDF测试文件。</p>
    <p>用于验证PDF支持功能。</p>
</body>
</html>"""

with open('test.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

# 使用系统命令转换 HTML 到 PDF（macOS）
try:
    result = subprocess.run([
        'cupsfilter', 
        '-i', 'text/html',
        '-o', 'application/pdf',
        'test.html'
    ], capture_output=True, stdout=open('test_sample.pdf', 'wb'), stderr=subprocess.PIPE)
    
    if os.path.exists('test_sample.pdf') and os.path.getsize('test_sample.pdf') > 0:
        print('PDF created using cupsfilter')
    else:
        raise Exception('cupsfilter failed')
except Exception as e:
    print(f'cupsfilter not available: {e}')
    print('Will create a minimal PDF manually')
    
    # 创建一个最小的 PDF（手动构造）
    minimal_pdf = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 85
>>
stream
BT
/F1 12 Tf
100 700 Td
(This is a PDF test file.) Tj
0 -20 Td
(PDF support verification.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
451
%%EOF"""
    
    with open('test_sample.pdf', 'wb') as f:
        f.write(minimal_pdf)
    print('PDF created manually')

# 清理
if os.path.exists('test.html'):
    os.remove('test.html')
