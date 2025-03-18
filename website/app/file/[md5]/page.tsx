"use client"
import { useParams } from 'next/navigation';
import { FileCard } from "@/src/components/client/FileCard";

export default function Page() {
    const params = useParams();
    const md5 = Array.isArray(params?.md5) ? params.md5[0] : params?.md5 ?? '';
    return (
        <div>
            <FileCard md5={md5}/>
        </div>
    );
}