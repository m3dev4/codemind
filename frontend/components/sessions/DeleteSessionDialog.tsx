"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  sessionInfo?: {
    device: string;
    location: string;
  };
}

export const DeleteSessionDialog: React.FC<DeleteSessionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  sessionInfo,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-neutral-900 text-white font-sora border-[#A78BFA]">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
          <AlertDialogDescription>
            {sessionInfo ? (
              <>
                Vous êtes sur le point de supprimer la session depuis{" "}
                <span className="font-medium text-[#A78BFA]">{sessionInfo.device}</span> à{" "}
                <span className="font-medium text-[#A78BFA]">{sessionInfo.location}</span>. Cette
                action est irréversible et déconnectera cet appareil.
              </>
            ) : (
              "Cette action est irréversible et déconnectera cet appareil."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="bg-accent-foreground border-accent-foreground"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
