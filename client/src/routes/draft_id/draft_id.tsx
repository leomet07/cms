import React from "react";
import "./draft_id.css";
import { useEffect, useState } from "react";
import store from "../../store";
import Draft from "../../types/Draft";

import {
	// rest of the elements/components imported remain same
	useParams,
} from "react-router-dom";

interface DraftsResponse {
	drafts: Draft[];
	description: string;
}

function genFormattedContributors(contributors: string[]) {
	let formatted = "";
	for (let i = 0; i < contributors.length; i++) {
		let contributor = contributors[i];
		formatted += contributor;

		if (i < contributors.length - 1) {
			formatted += ", ";
		}
	}
	return formatted;
}

function Drafts() {
	const { slug: draft_id } = useParams();
	const [draft, setDraft] = useState<Draft | null>(null);
	const fetchDraft = async () => {
		const r = await fetch(window.BASE_URL + "/api/db/get_drafts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"auth-token": store.getState().validauthtoken.value,
			},
			body: JSON.stringify({ _id: draft_id }),
		});
		const rjson = (await r.json()) as DraftsResponse;

		setDraft(rjson.drafts[0]);
	};

	const submitEdit = async () => {
		console.log("Submit edit");
		const volume = document.getElementById("volume")?.innerText;
		const issue = document.getElementById("issue")?.innerText;
		const title = document.getElementById("title")?.innerText;
		const contributors_str =
			document.getElementById("contributors")?.innerText;
		const cover_image_contributor = document.getElementById(
			"cover_image_contributor"
		)?.innerText;
		const text = document.getElementById("text")?.innerText;

		let contributors = contributors_str ? contributors_str.split(",") : [];
		contributors = contributors.map((v) => v.trim());

		const send = {
			volume,
			issue,
			title,
			contributors,
			cover_image_contributors: contributors,
			text,
		};

		const r = await fetch(window.BASE_URL + "/api/db/update_draft", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"auth-token": store.getState().validauthtoken.value,
			},
			body: JSON.stringify({ draft_id: draft?._id, update: send }),
		});

		const rjson = (await r.json()) as { success: boolean };

		if (rjson.success) {
			location.reload();
		}
	};

	useEffect(() => {
		(async () => {
			if (store.getState().validauthtoken.value && draft == null) {
				await fetchDraft();
			} else {
				store.subscribe(async () => {
					if (store.getState().validauthtoken.value) {
						await fetchDraft();
					}
				});
			}
		})();
	});

	return (
		<div>
			<h2>Draft id: {draft_id}</h2>
			{draft ? (
				<div>
					<div id="draft_data">
						<h2>
							Volume:&nbsp;
							<span
								suppressContentEditableWarning={true}
								contentEditable
								id="volume"
							>
								{draft.volume}
							</span>
							&nbsp;|&nbsp; Issue:&nbsp;
							<span
								suppressContentEditableWarning={true}
								contentEditable
								id="issue"
							>
								{draft.issue}
							</span>
						</h2>
						<h2>
							Draft title:&nbsp;
							<span
								suppressContentEditableWarning={true}
								contentEditable
								id="title"
							>
								{draft.title}
							</span>
						</h2>
						<h3>
							Draft authors:&nbsp;
							<span
								suppressContentEditableWarning={true}
								contentEditable
								id="contributors"
							>
								{genFormattedContributors(draft.contributors)}
							</span>
						</h3>
						<img className="cover_image" src={draft.cover_image} />
						<h3>
							Image by&nbsp;
							<span
								suppressContentEditableWarning={true}
								contentEditable
								id="cover_image_contributor"
							>
								{draft.cover_image_contributor}
							</span>
						</h3>
						<div
							suppressContentEditableWarning={true}
							contentEditable
							id="text"
						>
							{draft.text}
						</div>
					</div>
					<button onClick={submitEdit}>Submit the edit</button>
				</div>
			) : (
				<div></div>
			)}
		</div>
	);
}

export default Drafts;
