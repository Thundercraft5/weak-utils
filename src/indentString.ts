export default function indentString(str: string, indent: string = "  ") {
	const split = str.trim().split("\n");

	return split.map(s => `${ indent }${ s }`).join("\n");
}