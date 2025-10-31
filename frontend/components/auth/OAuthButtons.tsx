import React from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { loginWithGoogle, loginWithGithub } from "@/utils/oauth";

interface OAuthButtonsProps {
  disabled?: boolean;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ disabled = false }) => {
  return (
    <div className="flex items-center space-x-3">
      <Button
        type="button"
        onClick={loginWithGoogle}
        className="flex items-center gap-3 cursor-pointer
          focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
        size="lg"
        disabled={disabled}
      >
        <FcGoogle />
        <span>Google</span>
      </Button>
      <Button
        type="button"
        onClick={loginWithGithub}
        className="flex items-center gap-3 cursor-pointer
          focus:outline-none focus:ring-0 transform hover:scale-105 transition-all duration-300 ease-in-out"
        size="lg"
        disabled={disabled}
      >
        <FaGithub />
        <span>GitHub</span>
      </Button>
    </div>
  );
};
