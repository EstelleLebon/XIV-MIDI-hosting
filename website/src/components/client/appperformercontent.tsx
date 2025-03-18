"use client";

import React, { useEffect, useState } from 'react';
import { Get_File_by_performer } from "../server/Get_Files";
import { CardContent } from "../ui/card";
import Loading from './loading';

interface FilesByPerformerContentProps {
  performer: string;
  numb: number;
}

export function Files_by_Performer_content({ performer, numb }: FilesByPerformerContentProps) {
  const [files, setFiles] = useState<{ link: string; name: string; path: string; createdAt: string; title: string; artist: string; editor: string; performer: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await Get_File_by_performer(String(performer));
      const filesData = data.map((element: { link: string; artist: string; title: string; performer: string; editor: string; website_file_path: string; createdAt: Date; }) => ({
        link: element.link,
        name: `${element.artist} - ${element.title} - ${element.editor}`,
        path: element.website_file_path,
        createdAt: element.createdAt.toISOString(),
        title: element.title,
        artist: element.artist,
        editor: element.editor,
        performer: element.performer,
      }));
      setFiles(filesData);
      setLoading(false);
    };

    fetchData();
  }, [performer]);

  if (loading) {
    return (
		<div className="flex justify-center items-center h-80vh">
		  <Loading />
		</div>
		)
  }

  return (
    <>
      {files.slice(0, numb).map((file, index) => (
        <a href={file.link} className="" key={index}>
          <CardContent className="mb-1 bg-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors duration-300 text-sm truncate overflow-hidden whitespace-nowrap" style={{ height: '5px' }}>
            <p className="truncate">{file.name}</p>
          </CardContent>
        </a>
      ))}
    </>
  );
}