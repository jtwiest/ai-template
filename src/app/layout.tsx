import type { Metadata } from "next";
import { Asap_Condensed } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/contexts";

const asapCondensed = Asap_Condensed({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-asap-condensed",
	display: "swap",
});

export const metadata: Metadata = {
	title: "AirSense AI",
	description: "Tactical airspace intelligence platform",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${asapCondensed.variable} font-sans bg-background text-foreground`}>
				<AppProviders>
					<main className="min-h-screen">{children}</main>
				</AppProviders>
			</body>
		</html>
	);
}
