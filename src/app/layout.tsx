import type { Metadata } from 'next';
import './globals.css';
import './refined.css';
import './theme-motion.css';
import './creator.css';
export const metadata: Metadata = {title: 'VidSprout.ai — Your ideas, in motion', description: 'A private video workspace for educators and creators.'};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{document.documentElement.dataset.theme=localStorage.getItem('vidsprout-theme')==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}`}}/></head><body>{children}</body></html>;
}
