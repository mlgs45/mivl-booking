import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        className="text-neutral-700 hover:text-primary"
      >
        Déconnexion
      </Button>
    </form>
  );
}
