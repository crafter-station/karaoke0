import { useCallback, useEffect, useState } from "react";

export function useTheme() {
	const [isDark, setIsDark] = useState(() => {
		if (typeof document === "undefined") return true;
		return document.documentElement.classList.contains("dark");
	});

	useEffect(() => {
		const check = () =>
			setIsDark(document.documentElement.classList.contains("dark"));
		check();

		const observer = new MutationObserver(check);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	const toggle = useCallback(() => {
		const next = !document.documentElement.classList.contains("dark");
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
		setIsDark(next);
	}, []);

	return { isDark, toggle };
}
