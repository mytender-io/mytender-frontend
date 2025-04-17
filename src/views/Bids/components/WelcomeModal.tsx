import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import posthog from "posthog-js";
import { Link } from "react-router-dom";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-6xl px-12">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-hint_text">
            Welcome to mytender.io🤩💫
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <p>
            Here is a video run through to help you get onboarded and ready to
            creating winning bids
          </p>
          <div className="aspect-video w-full px-4">
            <iframe
              src="https://www.loom.com/embed/97d7dfe38b7548ebbc5089814cd921b7?sid=6cca4314-4725-49f8-9c5b-69202b29af41"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
          <p>
            Likewise, here is a quicker interactive demo to go through at your
            own pace
          </p>
          <Link to="/storyline" className="font-medium">
            storylanelink
          </Link>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              posthog.capture("welcome_video_watched");
              onClose();
            }}
          >
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
