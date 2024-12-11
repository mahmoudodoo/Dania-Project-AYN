import api from "../api";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const NewsPage = () => {
  const [news, setNews] = useState([]); // تغيير الحالة الأولية إلى مصفوفة
  const { newsId } = useParams();

  useEffect(() => {
    // جلب الأخبار بناءً على معرف الخبر
    api
      .get(`https://data.cityofchicago.org/resource/ijzp-q8t2.json?$query=SELECT * WHERE id='${newsId}'`)
      .then((response) => {
        if (response.data.length > 0) {
          setNews(response.data); // تعيين المصفوفة بأكملها
        } else {
          console.error("No news found with that ID");
        }
      })
      .catch((error) => {
        console.error("Error fetching the news:", error);
      });
  }, [newsId]);

  if (news.length === 0) {
    return <div>Loading...</div>; // عرض حالة التحميل أثناء جلب البيانات
  }

  return (
    <div>
      <Nav />
      <div className="newspage-container">
        <div className="newspage-content">
          {news.map((item) => (
            <div key={item.id}>
              {item.image && (
                <img src={item.image || img} alt={item.case_number} className="newspage-image" />
              )}
              <h1 className="newspage-title">{item.case_number}</h1>
              <p className="newspage-body">{item.description || "No description available"}</p>
              <p className="newspage-date">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
