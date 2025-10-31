import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInPage from "./sign-in/page";
import SingnUpPage from "./sign-up/page";

const AuthLayout = () => {
  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto">
        <div className="flex items-center justify-between w-full">
          <section className="w-full bg-amber-700 h-screen"></section>
          <section className="h-screen w-full">
            <div className="container mx-auto">
              <div className="py-5">
                <div className="flex flex-col justify-center items-center">
                  <h2 className="text-2xl font-bold font-sora">Happy to see you 😊</h2>
                  <p className="text-muted-foreground">Veuillez vous connecter ou vous inscrire</p>

                  <div className="w-full py-7 flex items-center justify-center">
                    <Tabs defaultValue="sign-in" className="w-xs">
                      <TabsList className="w-full ">
                        <TabsTrigger value="sign-in">Se connecter</TabsTrigger>
                        <TabsTrigger value="sign-up">S'inscrire</TabsTrigger>
                      </TabsList>
                      <TabsContent value="sign-in">
                        <SignInPage />
                      </TabsContent>
                      <TabsContent value="sign-up">
                        <SingnUpPage />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
