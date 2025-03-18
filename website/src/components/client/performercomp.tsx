import { Get_File_by_performer } from "../server/Get_Files";
import { useState, useEffect, SetStateAction } from "react";
import Link from 'next/link';
import { Card, CardContent, CardTitle } from "../ui/card";
import { FileDlButton } from "./FileDlButton";
import Loading from "./loading";

interface FilesForPerformerProps {
    performer: string;
}

export const Files_for_Performer: React.FC<FilesForPerformerProps> = ({ performer }) => {
    const [files, setFiles] = useState<{ link: string; name: string; path: string; createdAt: string; title: string; artist: string; editor: string; performer: string; }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [sortKey, setSortKey] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [artistFilter, setArtistFilter] = useState('');
    const [titleFilter, setTitleFilter] = useState('');
    const [editorFilter, setEditorFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        Get_File_by_performer(String(performer))
            .then((data: { link: string; artist: string; title: string; performer: string; editor: string; website_file_path: string; createdAt: Date; }[]) => {
                const result: { link: string; name: string; path: string; createdAt: string; title: string; artist: string; editor: string; performer: string; }[] = [];
                data.forEach((element: { link: string; artist: string; title: string; performer: string; editor: string; website_file_path: string; createdAt: Date; }) => {
                    const elem = {
                        link: element.link,
                        name: `${element.artist}_${element.title}_${element.performer}_${element.editor}.mid`,
                        path: element.website_file_path,
                        createdAt: element.createdAt.toISOString(),
                        title: element.title,
                        artist: element.artist,
                        editor: element.editor,
                        performer: element.performer,
                    };
                    result.push(elem);
                });
                setFiles(result);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, [performer]);

    const handleSort = (key: SetStateAction<string>) => {
        setSortKey(key);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleArtistFilterChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setArtistFilter(event.target.value);
    };

    const handleTitleFilterChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setTitleFilter(event.target.value);
    };

    const handleEditorFilterChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setEditorFilter(event.target.value);
    };

    const filteredFiles = files.filter((file) =>
        file.artist.toLowerCase().includes(artistFilter.toLowerCase()) &&
        file.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
        file.editor.toLowerCase().includes(editorFilter.toLowerCase())
    );

    const isFileKey = (key: string): key is keyof typeof files[0] => {
        return ['link', 'name', 'path', 'createdAt', 'title', 'artist', 'editor', 'performer'].includes(key);
    };

    const sortedFiles = filteredFiles.sort((a, b) => {
        if (!isFileKey(sortKey)) return 0;
        if (sortOrder === 'asc') {
            return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
            return a[sortKey] < b[sortKey] ? 1 : -1;
        }
    });

    const getSortIcon = (key: string) => {
        if (sortKey === key) {
            return sortOrder === 'asc' ? '▲' : '▼';
        }
        return '';
    };

    return (
        <div className="min-w-[1040px] p-4">
            <Card className="min-w-[1040px] p-2 bg-gray-400">
                <CardTitle className="text-center p-4 bg-gray-200 rounded-lg">
                    {performer.charAt(0).toUpperCase() + performer.slice(1)}s
                </CardTitle>
                <br />
                <CardContent>
                    {loading && <Loading />}
                    {error && <p>Error: {error.message}</p>}
                    {files && !loading && (
                        <>
                            <table className="min-w-full bg-white rounded-lg border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-gray-300">
                                        <th className="py-1 px-1 cursor-pointer" onClick={() => handleSort('artist')}>
                                            Artist {getSortIcon('artist')}
                                        </th>
                                        <th className="py-1 cursor-pointer" onClick={() => handleSort('title')}>
                                            Title {getSortIcon('title')}
                                        </th>
                                        <th className="py-1 cursor-pointer" onClick={() => handleSort('editor')}>
                                            Editor {getSortIcon('editor')}
                                        </th>
                                        <th className="py-1 cursor-pointer" onClick={() => handleSort('createdAt')}>
                                            Uploaded At {getSortIcon('createdAt')}
                                        </th>
                                        <th className="py-1 px-2"></th>
                                        <th className="py-1 px-2"></th>
                                    </tr>
                                    <tr className="border-b border-gray-300">
                                        <th className="py-1 px-1 text-left text-sm">
                                            <input
                                                type="text"
                                                placeholder="Filter artist"
                                                value={artistFilter}
                                                onChange={handleArtistFilterChange}
                                                className="p-2 border rounded"
                                            />
                                        </th>
                                        <th className="py-1 text-left text-sm">
                                            <input
                                                type="text"
                                                placeholder="Filter title"
                                                value={titleFilter}
                                                onChange={handleTitleFilterChange}
                                                className="p-2 border rounded"
                                            />
                                        </th>
                                        <th className="py-1 text-left text-sm">
                                            <input
                                                type="text"
                                                placeholder="Filter editor"
                                                value={editorFilter}
                                                onChange={handleEditorFilterChange}
                                                className="p-2 border rounded"
                                            />
                                        </th>
                                        <th className="py-1 text-left px-2"></th>
                                        <th className="py-1 text-left px-2"></th>
                                        <th className="py-1 text-left px-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedFiles.map((file, index) => (
                                        <tr key={index} className="text-left border-b border-gray-300 hover:bg-gray-100 cursor-pointer">
                                            <td className="py-1 px-1">
                                                <Link legacyBehavior href={`${file.link}`}>
                                                    <a className="block w-full h-full">{file.artist}</a>
                                                </Link>
                                            </td>
                                            <td className="py-1 px-1">
                                                <Link legacyBehavior href={`${file.link}`}>
                                                    <a className="block w-full h-full">{file.title}</a>
                                                </Link>
                                            </td>
                                            <td className="py-1 px-1">
                                                <Link legacyBehavior href={`${file.link}`}>
                                                    <a className="block w-full h-full">{file.editor}</a>
                                                </Link>
                                            </td>
                                            <td className="py-1 px-1">
                                                <Link legacyBehavior href={`${file.link}`}>
                                                    <a className="block w-full h-full">{new Date(file.createdAt).toLocaleDateString()}</a>
                                                </Link>
                                            </td>
                                            <td className="py-1">
                                                <FileDlButton website_file_path={file.path} classname="p-2 bg-black hover:bg-white text-white hover:text-black transition-colors duration-300" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};