import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata = { title: "Registracija" };
export default function RegisterPage() { return <Card><CardHeader className="text-center"><CardTitle className="font-serif text-3xl">Napravite svoj nalog</CardTitle><CardDescription>Pripremite se za jednostavniju kupovinu i negu biljaka.</CardDescription></CardHeader><CardContent><AuthForm mode="register" /></CardContent></Card>; }
