"use client";

import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ManualDeleteInstructionsProps {
  open: boolean;
  onClose: () => void;
  email: string;
  uid: string;
}

export function ManualDeleteInstructions({ open, onClose, email, uid }: ManualDeleteInstructionsProps) {
  const [copiedUID, setCopiedUID] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = async (text: string, type: 'uid' | 'email') => {
    await navigator.clipboard.writeText(text);
    if (type === 'uid') {
      setCopiedUID(true);
      setTimeout(() => setCopiedUID(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/_/authentication/users', '_blank');
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            ⚠️ Acción Manual Requerida
          </AlertDialogTitle>
          <AlertDialogDescription>
            Los datos del usuario fueron eliminados de Firestore, pero la cuenta de Authentication debe eliminarse manualmente en Firebase Console.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Información del usuario */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm">{email}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(email, 'email')}
                >
                  {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">UID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs">{uid}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(uid, 'uid')}
                >
                  {copiedUID ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Instrucciones paso a paso */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Pasos para eliminar de Authentication:</h4>
            
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <div className="flex-1">
                  <p className="font-medium">Abre Firebase Console</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={openFirebaseConsole}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Firebase Console
                  </Button>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <div className="flex-1">
                  <p className="font-medium">Navega a Authentication</p>
                  <p className="text-muted-foreground mt-1">
                    En el menú lateral, click en <strong>Authentication</strong> → <strong>Users</strong>
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <div className="flex-1">
                  <p className="font-medium">Busca el usuario</p>
                  <p className="text-muted-foreground mt-1">
                    Busca por email: <code className="bg-muted px-1 py-0.5 rounded">{email}</code>
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </span>
                <div className="flex-1">
                  <p className="font-medium">Elimina la cuenta</p>
                  <p className="text-muted-foreground mt-1">
                    Click en los <strong>tres puntos</strong> (⋮) a la derecha del usuario → <strong>Delete account</strong>
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  5
                </span>
                <div className="flex-1">
                  <p className="font-medium">Confirma la eliminación</p>
                  <p className="text-muted-foreground mt-1">
                    Click en <strong>Delete</strong> para confirmar
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Nota */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>Nota:</strong> Para automatizar esto en el futuro, necesitarías configurar Firebase Admin SDK con una service account.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>
            Entendido
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
