"use server"

const discordbdd = process.env.DISCORD_BDD_IP;

interface DataElement {
    tracks: Track[];
    comments: string;
    sources: string;
    website_file_path: string;
    editor: string;
    performer: string;
    title: string;
    artist: string;
    website_link: string;
    createdAt: Date;
}
export type Instrument =
	| 'Piano'
	| 'Harp'
	| 'Fiddle'
	| 'Lute'
	| 'Fife'
	| 'Flute'
	| 'Oboe'
	| 'Panpipes'
	| 'Clarinet'
	| 'Trumpet'
	| 'Saxophone'
	| 'Trombone'
	| 'Horn'
	| 'Tuba'
	| 'Violin'
	| 'Viola'
	| 'Cello'
	| 'DoubleBass'
	| 'ElectricGuitarOverdriven'
	| 'ElectricGuitarClean'
	| 'ElectricGuitarMuted'
	| 'ElectricGuitarPowerChords'
	| 'ElectricGuitarSpecial'
	| 'ElectricGuitar'
	| 'BassDrum'
	| 'SnareDrum'
	| 'Cymbal'
	| 'Bongo'
	| 'Timpani'
	| 'Unknown';

export type Track = {
	order: number;
	name: string;
	instrument: Instrument;
	modifier: number;
};

export async function Get_File(md5: string): Promise<{ link: string; artist: string; title: string; performer: string; editor: string; sources:string; comments:string; website_file_path:string }[]> {
    try {
        const response = await fetch(`${discordbdd}/files?website=true&md5=${md5}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const datatmp = await response.json();
        console.log('Data received from API:', datatmp);

        if (!datatmp.files || datatmp.files.length === 0) {
            console.log('No data found for md5:', md5);
            return [];
        }

        const data: { link: string; artist: string; title: string; performer: string; editor: string; sources: string; comments: string; website_file_path:string; createdAt:Date}[] = [];
        datatmp.files.forEach((element: DataElement) => {
                data.push({
                    link: element.website_link,
                    artist: element.artist,
                    title: element.title,
                    performer: element.performer,
                    editor: element.editor,
                    sources: element.sources, // Add appropriate value for sources
                    comments: element.comments, // Add appropriate value for comments
                    website_file_path: element.website_file_path,
                    createdAt: new Date(element.createdAt)
                });
            
        });

        console.log('Filtered data:', data);
        return data;
    } catch (error) {
        console.error('Error getting files per performer:', error);
        throw error;
    }
}

  export async function Get_File_by_performer(performer: string): Promise<{ link: string; artist: string; title: string; performer: string; editor: string; website_file_path:string; instrument:Instrument[]; createdAt:Date}[]> {
    try {
        const response = await fetch(`${discordbdd}/files?website=true&performer=${performer.charAt(0).toUpperCase() + performer.slice(1)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const datatmp = await response.json();
        console.log('Data received from API:', datatmp);

        if (!datatmp.files || datatmp.files.length === 0) {
            console.log('No data found for performer:', performer);
            return [];
        }

        datatmp.files.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const data: { link: string; artist: string; title: string; performer: string; editor: string; website_file_path:string; instrument:Instrument[]; createdAt:Date}[] = [];
        datatmp.files.forEach((element: DataElement) => {
            if (element.performer.toLowerCase() === performer.toLowerCase()) {
                const tracks = element.tracks
                const instrument: Instrument[] = [];
                tracks.forEach((track) => {
                    instrument.push(track.instrument);
                });
                data.push({
                    link: element.website_link,
                    artist: element.artist,
                    title: element.title,
                    performer: element.performer,
                    editor: element.editor,
                    website_file_path: element.website_file_path,
                    createdAt: new Date(element.createdAt),
                    instrument: instrument
                });
            }
        });

        console.log('Filtered data:', data);
        return data;
    } catch (error) {
        console.error('Error getting files per performer:', error);
        throw error;
    }
}