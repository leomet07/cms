import "./drafts.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Draft from "../../types/Draft";
import deleteDraft from "../../helpers/delete_draft";
import handle_error from "../../helpers/handle_error";
import safe_fetch from "../../helpers/safe_fetch";
import useAuth from "../../helpers/useAuth";

interface DraftsResponse {
	drafts: Draft[];
	description: string;
}

function Drafts() {
	const { loading, validauthtoken, isAdmin } = useAuth();
	const [drafts, setDrafts] = useState<Draft[] | null>(null);

	const fetchDrafts = async () => {
		const rjson = (await safe_fetch(
			window.BASE_URL + "/api/db/get_drafts",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"auth-token": validauthtoken,
				},
			}
		)) as DraftsResponse;

		setDrafts(rjson.drafts);
	};

	useEffect(() => {
		(async () => {
			if (validauthtoken) {
				await fetchDrafts().catch(handle_error);
			}
		})();
	}, [validauthtoken]);

	let genDrafts: any = <></>;
	if (drafts != null) {
		genDrafts =
			drafts.length > 0 ? (
				drafts.map((item, _) => (
					<div className="draft_quickview" key={item._id}>
						<Link to={"/draft/" + item._id}>
							<h2>{item.title}</h2>
							<h3>{item.summary}</h3>
						</Link>
						<button
							onClick={() => {
								deleteDraft(item._id);
							}}
						>
							Delete
						</button>
					</div>
				))
			) : (
				<h2>There have been no drafts!</h2>
			);
	}

	return (
		<div>
			<h1>All drafts:</h1>
			{genDrafts}
		</div>
	);
}

export default Drafts;
