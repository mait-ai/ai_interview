// Extract plain text from an uploaded PDF entirely in the browser using pdf.js.
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  const pageCount = pdf.numPages
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map((item) => (item && 'str' in item ? item.str : '')).filter(Boolean)
    text += strings.join(' ') + '\n'
  }
  return text.replace(/[ \t]+/g, ' ').trim()
}
