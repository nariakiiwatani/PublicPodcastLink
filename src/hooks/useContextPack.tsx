import { createContext, useState, useCallback } from 'react'

export const useContextPack = <T,>(defaultValue?:T) => {
	const [Context, _] = useState(()=>createContext<T|undefined>(defaultValue))
	const Provider = useCallback(({value, children}:{value: T, children:React.ReactNode}) => <Context.Provider value={value}>{children}</Context.Provider>, [Context])
	const Consumer = useCallback(({children}:{children:(value:T)=>React.ReactNode}) => <Context.Consumer>{
		value => {
			if(value === undefined) throw new Error('value is undefined')
			return children(value)
		}
	}</Context.Consumer>, [Context])
	const ProviderConsumer = useCallback(({value, children}:{value:T, children:(value:T)=>React.ReactNode}) => <Provider value={value}><Consumer>{children}</Consumer></Provider>, [Provider, Consumer])
	const ArrayProvider = useCallback(({value, children}:{value:T[], children:React.ReactNode}) => (<>{value.map((v,i)=><Provider key={i} value={v}>{children}</Provider>)}</>), [Provider])
	const ArrayProviderConsumer = useCallback(({value, children}:{value:T[], children:(value:T)=>React.ReactNode}) => (<ArrayProvider value={value}><Consumer>{children}</Consumer></ArrayProvider>), [ArrayProvider, Consumer])
	const ObjectProvider = useCallback(({value, children}:{value:{[key:string]:T}, children:React.ReactNode}) => (<>{Object.entries(value).map(([k,v])=><Provider key={k} value={v}>{children}</Provider>)}</>), [Provider])
	const ObjectProviderConsumer = useCallback(({value, children}:{value:{[key:string]:T}, children:(value:T)=>React.ReactNode}) => (<ObjectProvider value={value}><Consumer>{children}</Consumer></ObjectProvider>), [ObjectProvider, Consumer])
	return {
		Context,
		Provider, Consumer, ProviderConsumer,
		ArrayProvider, ArrayProviderConsumer,
		ObjectProvider, ObjectProviderConsumer
	}
}
