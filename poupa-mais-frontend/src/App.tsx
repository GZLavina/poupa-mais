import './App.css'
import { decrement, increment, incrementByAmount } from './features/counter/counterSlice'
import { useAppDispatch, useAppSelector } from './app/hooks'

function App() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <main className="app-container">
      <h1>Poupa Mais Frontend</h1>
      <p>React + TypeScript + Redux Toolkit configurados.</p>

      <section className="counter-card">
        <h2>Contador global</h2>
        <p className="count-value">{count}</p>
        <div className="actions">
          <button type="button" onClick={() => dispatch(decrement())}>
            -1
          </button>
          <button type="button" onClick={() => dispatch(increment())}>
            +1
          </button>
          <button type="button" onClick={() => dispatch(incrementByAmount(10))}>
            +10
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
