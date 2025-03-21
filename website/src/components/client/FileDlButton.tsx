"use client"
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";

interface FileDlButtonProps {
    website_file_path: string;
    classname: string;
}

export function FileDlButton({ website_file_path, classname }: FileDlButtonProps) {
    const [buttonLoading, setButtonLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        if (buttonLoading) {
            // Add a class to the button to show a loading spinner
            document.querySelector('button')?.classList.add('loading');
        } else {
            // Remove the loading spinner class when loading is false
            document.querySelector('button')?.classList.remove('loading');
        }
    }, [buttonLoading]);

    return (
        <Button
            onClick={() => {
                setButtonLoading(true);
                setTimeout(() => {
                    setButtonLoading(false);
                    setDownloaded(true);
                    window.location.href = website_file_path;
                }, 3000); // Adjust the timeout duration as needed
            }}
            variant="default"
            className={classname}
        >
            {downloaded ? 'Download started' : 'Download'}
        </Button>
    );
}

export default FileDlButton;