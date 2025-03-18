"use client"
import { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Get_File } from "../server/Get_Files";
import { FileDlButton } from "./FileDlButton";
import React from 'react';
import Loading from "./loading";

interface FileCardProps {
    md5: string;
}

const YouTubeEmbed = ({ url }: { url: string }) => {
    let videoID = "";
    if (url.includes("youtu.be")) {
        videoID = url.split("youtu.be/")[1];
    } 
    else if (url.includes("www.youtube.com/watch?v=")) {
        videoID = url.split('watch?v=')[1]?.split('&')[0];
    } else {
      return <p>Invalid YouTube URL</p>;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoID}`;
  
    return (
      <>
        <iframe
          width="560"
          height="315"
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </>
    );
  };
  
  const formatLinks = (text: string): JSX.Element => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
  
    return (
      <>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            if (part.includes("youtube.com") || part.includes("youtu.be")) {
              return <YouTubeEmbed key={index} url={part} />;
            }
            return (
              <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

export const FileCard: React.FC<FileCardProps> = ({ md5 }) => {
    const [file, setFile] = useState<{ website_file_path: string; artist: string; title: string; performer: string; editor: string; sources: string; comments: string; } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (md5) {
            setLoading(true);
            setError(null);
            Get_File(md5)
                .then((data: { website_file_path: string; artist: string; title: string; performer: string; editor: string; sources: string; comments: string; }[]) => {
                    if (!data || data.length === 0) {
                        throw new Error('File not found');
                    } else {
                        setFile(data[0]);
                        setLoading(false);
                    }
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                });
        }
    }, [md5]);

    return (
        <div className="p-4">
            <Card className="flex flex-col justify-center items-center mx-auto p-4 bg-gray-100" style={{ width: 'fit-content', minWidth: '25%', maxWidth: '90%' }}>
                <CardTitle className="text-center text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 bg-gray-200 rounded-lg p-4">
                    {file && <p>{file.artist} - {file.title}</p>}
                </CardTitle>
                <CardContent className="text-left text-lg text-gray-800 dark:text-gray-200">
                    {loading && <Loading/>}
                    {error && <p className="p-2">Error: {error.message}</p>}
                    {file && <p className="p-2">Artist: {file.artist}</p>}
                    {file && <p className="p-2">Title: {file.title}</p>}
                    {file && <p className="p-2">Performer: {file.performer}</p>}
                    {file && <p className="p-2">Editor: {file.editor}</p>}
                    {file && file.sources != " " && <p className="p-2">Source: {formatLinks(file.sources)}</p>}
                    {file && file.comments != " " && <p className="p-2">Comment: {formatLinks(file.comments)}</p>}
                    {file && <FileDlButton website_file_path={file.website_file_path} classname="mt-4 text-xl py-2 px-4 bg-black text-white rounded-lg hover:bg-white hover:text-black transition-colors duration-300"/>}
                </CardContent>
            </Card>
        </div>
    )
}