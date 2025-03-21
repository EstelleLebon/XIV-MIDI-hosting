"use server"
import { Files_by_Performer_content } from "../client/appperformercontent";
import { Card, CardTitle } from "../ui/card";

interface FilesByPerformerProps {
	performer: string;
	numb: number;
}

export async function Files_by_Performer({ performer, numb }: FilesByPerformerProps) {
	return (
		<div className="p-4">
		  <Card className="overflow-hidden p-2 bg-gray-400" style={{ height: 'calc((100vh - 180px) / 2)', minHeight: '200px' }}>
			<a className="" href={`/${performer}`}>
			  <CardTitle className="text-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors duration-300">
				{performer.charAt(0).toUpperCase() + performer.slice(1)}s
			  </CardTitle>
			</a>
			<hr className="my-1 border-t border-gray-400" />
			<div className="overflow-hidden" style={{ maxHeight: 'calc((100vh - 180px) / 2)' }}>
			  <Files_by_Performer_content performer={performer} numb={numb} />
			</div>
		  </Card>
		</div>
	  );
	};
