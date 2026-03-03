import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/contexts";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
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
				className={`${inter.variable} font-sans bg-background text-foreground`}>
				<AppProviders>
					<main className="min-h-screen">{children}</main>
				</AppProviders>
			</body>
		</html>
	);
}
