import { useState } from "react"

type Toast = { id: number; type: "success" | "error"; message: string }

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((s) => [{ id, type, message }, ...s])
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 4000)
  }
  const remove = (id: number) => setToasts((s) => s.filter((t) => t.id !== id))
  const ToastsUI = () => (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-sm rounded-md p-3 shadow-lg text-sm ${
            t.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>{t.message}</div>
            <button onClick={() => remove(t.id)} className="ml-2 text-xs opacity-70">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
  return { push, ToastsUI }
}
