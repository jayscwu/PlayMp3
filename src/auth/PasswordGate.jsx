import { useState } from 'react'

export function PasswordGate({ login }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    setError(false)
    const ok = await login(password)
    setChecking(false)
    if (!ok) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={handleSubmit}>
        <h1>家庭音樂播放器</h1>
        <p>請輸入密碼以繼續</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          placeholder="密碼"
        />
        <button type="submit" disabled={checking || !password}>
          {checking ? '驗證中…' : '登入'}
        </button>
        {error && <p className="gate-error">密碼錯誤，請再試一次</p>}
      </form>
    </div>
  )
}
