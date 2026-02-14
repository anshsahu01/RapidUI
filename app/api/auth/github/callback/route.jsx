import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/?github_auth_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?github_auth_error=missing_code`);
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/?github_auth_error=missing_github_env`
    );
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData?.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        `${origin}/?github_auth_error=token_exchange_failed`
      );
    }

    const response = NextResponse.redirect(`${origin}/`);
    response.cookies.set("github_token", accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (e) {
    return NextResponse.redirect(`${origin}/?github_auth_error=server_error`);
  }
}
