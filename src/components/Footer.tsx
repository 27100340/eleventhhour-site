export default function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-16">
      <div className="mx-auto max-w-6xl p-6 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} EleventhHour Cleaning Services. All rights reserved.</p>
        <p>Call 020 8000 0000 · hello@eleventhhour.co.uk</p>
      </div>
    </footer>
  )
}
