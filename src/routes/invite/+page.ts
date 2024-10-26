export function load({ url, data }) {
	return {
		...data,
		code: url.searchParams.get("code"),
	};
}
