import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata = { title: "Prijava" };
export default function LoginPage() { return <Card><CardHeader className="text-center"><CardTitle className="font-serif text-3xl">Dobro došli nazad</CardTitle><CardDescription>Prijavite se da nastavite svoj Green Nest put.</CardDescription></CardHeader><CardContent><AuthForm mode="login" /></CardContent></Card>; }
