/**
 * Clipboard utility با fallback برای محیط‌هایی که Clipboard API بلاک شده
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: سعی در استفاده از Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // سایلنت fail - مستقیماً به fallback می‌ریم
    }
  }

  // Method 2: Fallback با execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // از صفحه خارج باشه ولی قابل select
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}