// App.js
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import Drafts from "./routes/drafts/drafts";
import Draft_id from "./routes/draft_id/draft_id";
import Create_draft from "./routes/create_draft/create_draft";
import Create_Staff_Route from "./routes/create_staff/create_staff";
import EditProductionArticle from "./routes/edit_prod/edit_prod";
import Access_Denied from "./routes/403/403";
import Not_Found from "./routes/404/404";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { ReactElement, ReactNode, useEffect } from "react";
import store from "./store";
import { useAppSelector } from "./hooks";
import ErrorModal from "./components/ErrorModal/ErrorModal";
import { setError } from "./reducers/error";
import safe_fetch from "./helpers/safe_fetch";
import useAuth from "./helpers/useAuth";
import { AuthProvider } from "./helpers/useAuth";

declare global {
	interface Window {
		BASE_URL: string;
	}
}

function RequireAuth({ children }: { children: ReactElement }) {
	const { loading, validauthtoken, isApproved } = useAuth();
	const location = useLocation();

	return <>
		{loading ? <h2>Loading...</h2> : <>{
			(validauthtoken && isApproved) !== "" ? (
				children
			) : (
				<Navigate to="/login" replace state={{ path: location.pathname }} />
			)}
		</>}
	</>
}

function App() {
	if (!import.meta.env.MODE || import.meta.env.MODE === "development") {
		console.log("Dev");
		window.BASE_URL = "http://127.0.0.1:5678";
	} else {
		console.log("Production");
		window.BASE_URL = "https://cms-alpha-backend.stuyspec.com";
	}

	return (
		<AuthProvider>
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="drafts" element={<RequireAuth><Drafts /></RequireAuth>} />
					<Route path="draft/:slug" element={<RequireAuth><Draft_id /></RequireAuth>} />
					<Route path="article/:slug" element={<RequireAuth><EditProductionArticle /></RequireAuth>} />
					<Route path="create_draft" element={<RequireAuth><Create_draft /></RequireAuth>} />
					<Route
						path="create_staff"
						element={<RequireAuth><Create_Staff_Route /></RequireAuth>}
					/>
					<Route path="403" element={<Access_Denied />} />
					<Route path="*" element={<Not_Found />} />
				</Routes>
			</main>
			<ErrorModal />
		</AuthProvider>
	);
}

function Home() {
	const { validauthtoken, isApproved, isAdmin, uid } = useAuth();


	const approveUser = async (e: any) => {
		e.preventDefault();
		if (isAdmin) {
			const uid_submission = e.target.elements["uid"].value;
			const rjson = (await safe_fetch(
				window.BASE_URL + "/api/auth/approve_user",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"auth-token": validauthtoken,
					},
					body: JSON.stringify({ uid: uid_submission }),
				}
			)) as { success: boolean };
			if (rjson.success) {
				e.target.reset();
			}
		} else {
			store.dispatch(setError("Non-admins cannot approve users!"));
		}
	};
	return (
		<main id="home_main">
			<h1>Home</h1>
			<h3>UID: {uid}</h3>
			{validauthtoken ? (
				<div>
					{!isApproved ? (
						<h1>
							YOU NEED TO REQUEST ACCOUNT VERIFICATION FROM A STUY
							SPEC ADMIN
						</h1>
					) : (
						<></>
					)}
					<p>Logged in!</p>
					<p>Is admin: {String(isAdmin)}</p>
					{isAdmin ? (
						<div>
							<h3>Approve a user:</h3>
							<form onSubmit={approveUser}>
								<input
									type="text"
									name="uid"
									placeholder="UID"
								/>
								<br />
								<input type="submit" />
							</form>
							<h3 id="create_staff_link">
								<Link to="/create_staff">
									Create a contributor
								</Link>
							</h3>
						</div>
					) : (
						<></>
					)}

					{isApproved ? (
						<div id="create_draft_div">
							<h1>
								<Link to="/create_draft">Create a draft</Link>
							</h1>
						</div>
					) : (
						<></>
					)}
				</div>
			) : (
				<div>
					<p>Not logged in. Please log in.</p>
				</div>
			)}
		</main>
	);
}

export default App;
