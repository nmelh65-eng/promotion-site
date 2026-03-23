import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAnalyticsSummary } from "@/lib/links-store";
import { getAllWorksLive } from "@/lib/works-store";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  try {
    const [works, links] = await Promise.all([
      getAllWorksLive(),
      getAnalyticsSummary(),
    ]);

    const publishedWorks = works.filter((item) => item.isPublished);
    const draftWorks = works.filter((item) => !item.isPublished);
    const featuredWorks = publishedWorks.filter((item) => item.isFeatured);

    const totalViews = works.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = works.reduce((sum, item) => sum + (item.likes || 0), 0);

    const poetryWorks = works.filter((item) => item.category === "poetry");
    const proseWorks = works.filter((item) => item.category === "prose");

    const topWorksByViews = [...works]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    const topWorksByLikes = [...works]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10);

    const recentWorks = [...works]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      data: {
        totals: {
          works: works.length,
          published: publishedWorks.length,
          drafts: draftWorks.length,
          featured: featuredWorks.length,
          totalViews,
          totalLikes,
          averageViews:
            works.length > 0 ? Number((totalViews / works.length).toFixed(2)) : 0,
          averageLikes:
            works.length > 0 ? Number((totalLikes / works.length).toFixed(2)) : 0,
        },
        byCategory: {
          poetry: {
            total: poetryWorks.length,
            published: poetryWorks.filter((item) => item.isPublished).length,
            drafts: poetryWorks.filter((item) => !item.isPublished).length,
          },
          prose: {
            total: proseWorks.length,
            published: proseWorks.filter((item) => item.isPublished).length,
            drafts: proseWorks.filter((item) => !item.isPublished).length,
          },
        },
        topWorksByViews,
        topWorksByLikes,
        recentWorks,
        links,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
