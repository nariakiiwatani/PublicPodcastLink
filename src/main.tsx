import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './hooks/useTranslation.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<LanguageProvider>
			<BrowserRouter>
				<Routes>
					<Route path='*' element={<App />} />
				</Routes>
			</BrowserRouter>
		</LanguageProvider>
	</React.StrictMode>,
)
