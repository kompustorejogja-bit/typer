import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const joinRoomSchema = z.object({
  code: z.string().length(10, "Room code must be exactly 10 characters"),
});

type JoinRoomForm = z.infer<typeof joinRoomSchema>;

interface JoinRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomJoined: (roomCode: string) => void;
}

export default function JoinRoomModal({ open, onOpenChange, onRoomJoined }: JoinRoomModalProps) {
  const { toast } = useToast();
  
  const form = useForm<JoinRoomForm>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      code: "",
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (data: JoinRoomForm) => {
      const response = await apiRequest("POST", "/api/rooms/join", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Joined Room!",
        description: `Successfully joined ${data.room.name}`,
      });
      onRoomJoined(data.room.code);
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      const errorMessage = error.message.includes("404") ? "Room not found" :
                          error.message.includes("full") ? "Room is full" :
                          error.message.includes("not accepting") ? "Game already in progress" :
                          "Failed to join room";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JoinRoomForm) => {
    joinRoomMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fas fa-door-open text-accent mr-2"></i>
            Join Room
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="RACE-2024AB" 
                      className="font-mono text-center text-lg tracking-wider uppercase"
                      maxLength={10}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      data-testid="input-room-code"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground text-center">
              Enter the 10-character room code shared by the host
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-join"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={joinRoomMutation.isPending}
                data-testid="button-submit-join"
              >
                {joinRoomMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-door-open mr-2"></i>
                )}
                Join Room
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
