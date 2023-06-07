import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_ID

const usePageTracking = () => {
	const location = useLocation();

	useEffect(() => {
		if(!GA_ID || GA_ID === '') return
		ReactGA.initialize(GA_ID);
		ReactGA.send({
			hitType: "pageview",
			page: location.pathname + location.search
		});
	}, [GA_ID, location]);
};

export default usePageTracking;