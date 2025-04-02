"use client"


import { reviewReport } from "@/app/api/report";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";


interface ReportReviewDialogueProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportId: string;
    user: User;
}

export default function ReportReviewDialogue({
    open,
    onOpenChange,
    reportId,
    user
}:
    ReportReviewDialogueProps
) {
    const [comments, setComments] = useState("");
    const router = useRouter();

    const handleRequestChanges = async () => {
        try {
            await reviewReport(reportId, user, comments);
            toast({
                title: "Changes Requested",
                description: "Your review has been sent to the report author.",
            });
        } catch (error) {
            console.error("Error requesting changes:", error);
            toast({
                title: "Error",
                description: "There was an error requesting changes. Please try again.",
                variant: "destructive",
            });
        }
        router.push(`/dashboard/incidents`);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <DialogTitle className="text-xl">Review Comments</DialogTitle>
                    </div>
                </DialogHeader>

                <Textarea
                    id="comments"
                    placeholder="Enter your comments or feedback about this report..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[150px]"
                />

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button disabled={!comments.trim()} onClick={handleRequestChanges} className="flex-1 sm:flex-auto">
                            Request Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}