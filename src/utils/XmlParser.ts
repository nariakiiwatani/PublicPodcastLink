import { useMemo } from 'react'
import { X2jOptionsOptional, XmlBuilderOptionsOptional, XMLBuilder, XMLParser } from 'fast-xml-parser';

const commonOption = {
	attributeNamePrefix: "@",
	ignoreAttributes: false,
	ignoreNameSpace: false,
	format: true,
	suppressEmptyNode: true
}

const defaultParseOption = {
	...commonOption,
	numberParseOptions: {
		hex: true,
        leadingZeros: true
    }
}

const defaultBuildOption = {
	...commonOption
}

export const parser = (options?: X2jOptionsOptional) => {
	const option = options?{...defaultParseOption, ...options} : defaultParseOption
	return new XMLParser(option)
}

export const useParser = (options?: X2jOptionsOptional) => {
	return useMemo(() => parser(options), [options])
}

export const builder = (options?: X2jOptionsOptional) => {
	const option = options?{...defaultBuildOption, ...options} : defaultBuildOption
	return new XMLBuilder(option)
}
export const useBuilder = (options?: XmlBuilderOptionsOptional) => {
	return useMemo(() => builder(options), [options])
}
