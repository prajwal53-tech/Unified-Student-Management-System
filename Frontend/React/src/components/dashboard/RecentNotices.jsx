import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getNotices } from "../../services/notice";

function RecentNotices() {

    const [notices, setNotices] = useState([]);

    useEffect(() => {

        async function loadNotices() {

            try {

                const data = await getNotices();

                setNotices(data.results || data);

            } catch (error) {

                console.error(error);

            }

        }

        loadNotices();

    }, []);

    return (

        <Card className="mt-8">

            <CardHeader>

                <CardTitle>

                    📢 Recent Notices

                </CardTitle>

            </CardHeader>

            <CardContent>

                {notices.length === 0 ? (

                    <p>No notices available.</p>

                ) : (

                    notices.slice(0,5).map((notice) => (

                        <div
                            key={notice.id}
                            className="border-b py-4"
                        >

                            <h3 className="font-semibold">

                                {notice.title}

                            </h3>

                            <p className="text-gray-500 text-sm">

                                {notice.description}

                            </p>

                        </div>

                    ))

                )}

            </CardContent>

        </Card>

    );

}

export default RecentNotices;