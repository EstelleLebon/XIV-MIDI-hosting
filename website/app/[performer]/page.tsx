"use client"
import { useParams } from 'next/navigation';
import { Files_for_Performer } from "@/src/components/client/performercomp";
import { notFound } from 'next/navigation';


export default function Page() {
    const params = useParams();
    const performer = Array.isArray(params?.performer) ? params.performer[0] : params?.performer ?? '';
    const performers = ["solo", "duet", "trio", "quartet", "quintet", "sextet", "septet", "octet"];

    if (!performers.includes(performer)) {
      notFound();
    }

  	return (
		<div className="">
			<div className="container mx-auto px-4">
				<Files_for_Performer performer={performer.toLowerCase()}/>
			</div>
		</div>
	);
}