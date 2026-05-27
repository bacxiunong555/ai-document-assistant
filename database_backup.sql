CREATE DATABASE  IF NOT EXISTS `rag_document_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rag_document_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: rag_document_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `doc_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (14,'Về việc mua sắm trang thiết bị văn phòng năm 2026','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 21 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"TRƯỞNG PHÒNG HÀNH CHÍNH\",\"ho_ten\":\"Nguyễn Bảo Phúc\"},\"noi_dung\":\"Kính gửi: Ban Giám đốc.\\n\\nCăn cứ Quy chế chi tiêu nội bộ của Phòng Hành chính - Tổng hợp;\\nCăn cứ Kế hoạch hoạt động năm 2026 của Phòng Hành chính - Tổng hợp,\\n\\nPhòng Hành chính - Tổng hợp trình Ban Giám đốc xem xét, phê duyệt chủ trương mua sắm trang thiết bị văn phòng phục vụ công tác năm 2026, cụ thể như sau:\\n\\nI. SỰ CẦN THIẾT:\\nĐể đảm bảo điều kiện làm việc, nâng cao hiệu quả công tác và thay thế các trang thiết bị đã cũ hỏng, không còn đáp ứng được yêu cầu sử dụng, Phòng Hành chính - Tổng hợp nhận thấy cần thiết phải bổ sung, thay thế một số trang thiết bị văn phòng trong năm 2026.\\n\\nII. NỘI DUNG ĐỀ XUẤT MUA SẮM:\\nPhòng Hành chính - Tổng hợp đề xuất mua sắm các trang thiết bị văn phòng với danh mục và dự kiến kinh phí như sau:\\n- 02 (hai) máy tính để bàn: 30.000.000 đồng (Ba mươi triệu đồng);\\n- 01 (một) máy in đa năng: 8.000.000 đồng (Tám triệu đồng);\\n- 01 (một) máy chiếu: 15.000.000 đồng (Mười lăm triệu đồng);\\n- 05 (năm) bộ bàn ghế văn phòng: 25.000.000 đồng (Hai mươi lăm triệu đồng);\\n- 02 (hai) tủ đựng tài liệu: 12.000.000 đồng (Mười hai triệu đồng).\\n\\nIII. TỔNG KINH PHÍ DỰ KIẾN:\\nTổng kinh phí dự kiến cho việc mua sắm các trang thiết bị nêu trên là: 90.000.000 đồng (Chín mươi triệu đồng chẵn). Kinh phí này sẽ được trích từ nguồn ngân sách hoạt động thường xuyên của Phòng Hành chính - Tổng hợp năm 2026 đã được phê duyệt.\\n\\nIV. KÍNH ĐỀ NGHỊ:\\nKính đề nghị Ban Giám đốc xem xét, phê duyệt chủ trương mua sắm trang thiết bị văn phòng theo danh mục và kinh phí dự kiến nêu trên để Phòng Hành chính - Tổng hợp có cơ sở triển khai thực hiện theo đúng quy định hiện hành.\\n./.\",\"noi_nhan\":[\"- Ban Giám đốc;\",\"- Lưu HCTH.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 05/TTr-HCTH\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":null,\"chinh\":\"Phòng Hành chính - Tổng hợp\"},\"ten_loai\":\"TỜ TRÌNH\",\"trich_yeu\":\"Về việc mua sắm trang thiết bị văn phòng năm 2026\"}','TỜ TRÌNH','ban_nhap',1,'2026-05-21 06:57:20','2026-05-21 09:28:48'),(15,'Về việc khen thưởng sinh viên dũng cảm','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 21 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"HIỆU TRƯỞNG\",\"ho_ten\":\"Nguyễn Bảo Phúc\"},\"noi_dung\":\"Căn cứ Luật Giáo dục đại học số 08/2012/QH13 ngày 17 tháng 6 năm 2012 và Luật sửa đổi, bổ sung một số điều của Luật Giáo dục đại học số 34/2018/QH14 ngày 19 tháng 11 năm 2018;\\nCăn cứ Điều lệ trường đại học ban hành kèm theo Thông tư số 01/VBHN-BGDĐT ngày 26 tháng 01 năm 2023 của Bộ trưởng Bộ Giáo dục và Đào tạo;\\nCăn cứ Quy chế công tác sinh viên đối với các ngành đào tạo trình độ đại học hệ chính quy ban hành kèm theo Thông tư số 10/2016/TT-BGDĐT ngày 05 tháng 4 năm 2016 của Bộ trưởng Bộ Giáo dục và Đào tạo;\\nCăn cứ Quy chế tổ chức và hoạt động của Trường Đại học Bách khoa Đà Nẵng;\\nCăn cứ Quy định về công tác khen thưởng, kỷ luật sinh viên của Trường Đại học Bách khoa Đà Nẵng;\\nXét đề nghị của Trưởng phòng Công tác Sinh viên,\\n\\nQUYẾT ĐỊNH:\\n\\nĐiều 1. Khen thưởng sinh viên có tên sau:\\nÔng/Bà: PHAN MINH HIẾU\\nMã số sinh viên: 102230015\\nLớp: 23T_Nhat1\\nKhoa: Công nghệ thông tin\\nĐã có hành động dũng cảm cứu người đuối nước tại biển Nguyễn Chánh vào ngày 15 tháng 5 năm 2026.\\nHình thức khen thưởng: Giấy khen của Hiệu trưởng và tiền thưởng 1.000.000 đồng (Một triệu đồng).\\n\\nĐiều 2. Phòng Công tác Sinh viên, Phòng Kế hoạch – Tài chính và các đơn vị có liên quan chịu trách nhiệm thi hành Quyết định này.\\n\\nĐiều 3. Quyết định này có hiệu lực kể từ ngày ký./.\",\"noi_nhan\":[\"- Như Điều 3;\",\"- Phòng Công tác Sinh viên;\",\"- Phòng Kế hoạch - Tài chính;\",\"- Lưu: VT, P.CTSV.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 123/QĐ-ĐHBK\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":null,\"chinh\":\"TRƯỜNG ĐẠI HỌC \\nBÁCH KHOA ĐÀ NẴNG\"},\"ten_loai\":\"QUYẾT ĐỊNH\",\"trich_yeu\":\"Về việc khen thưởng sinh viên dũng cảm\"}','QUYẾT ĐỊNH','ban_nhap',1,'2026-05-21 07:43:12','2026-05-21 09:18:55'),(16,'Về việc quy hoạch hóa khu đô thị nông thôn mới','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 21 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"CHỦ TỊCH\",\"ho_ten\":\"Nguyễn Bảo Nam\"},\"noi_dung\":\"Căn cứ Luật Quy hoạch đô thị số 30/2009/QH12 ngày 17 tháng 6 năm 2009;\\nCăn cứ Luật sửa đổi, bổ sung một số điều của 37 luật có liên quan đến quy hoạch số 35/2018/QH14 ngày 20 tháng 11 năm 2018;\\nCăn cứ Nghị định số 37/2010/NĐ-CP ngày 07 tháng 4 năm 2010 của Chính phủ về lập, thẩm định, phê duyệt và quản lý quy hoạch đô thị;\\nCăn cứ Quyết định số 1234/QĐ-UBND ngày 15 tháng 3 năm 2026 của Ủy ban nhân dân thành phố Đà Nẵng về việc phê duyệt chủ trương lập quy hoạch chi tiết khu đô thị Hòa Khánh Bắc, phường Liên Chiểu.\\nXét đề nghị của Ban Quản lý đô thị phường Liên Chiểu,\\nỦy ban nhân dân phường Liên Chiểu ban hành Kế hoạch về việc lập quy hoạch chi tiết khu đô thị Hòa Khánh Bắc, phường Liên Chiểu, với các nội dung sau:\\n\\nI. MỤC ĐÍCH, YÊU CẦU\\n1. Mục đích:\\n- Cụ thể hóa quy hoạch chung, quy hoạch phân khu đã được phê duyệt, làm cơ sở pháp lý cho việc quản lý, đầu tư xây dựng và phát triển khu đô thị Hòa Khánh Bắc.\\n- Xây dựng khu đô thị Hòa Khánh Bắc phát triển đồng bộ, hiện đại, bền vững, có hệ thống hạ tầng kỹ thuật và hạ tầng xã hội hoàn chỉnh, đáp ứng nhu cầu của người dân.\\n- Khai thác hiệu quả tiềm năng đất đai, tài nguyên, tạo động lực phát triển kinh tế – xã hội cho địa phương.\\n2. Yêu cầu:\\n- Đảm bảo tính khoa học, khả thi, phù hợp với điều kiện tự nhiên, kinh tế – xã hội và định hướng phát triển chung của thành phố Đà Nẵng.\\n- Phát huy tối đa tiềm năng, lợi thế của khu vực, tạo không gian sống chất lượng cao, hài hòa với cảnh quan thiên nhiên.\\n- Hài hòa lợi ích của Nhà nước, cộng đồng dân cư và các nhà đầu tư trong quá trình triển khai quy hoạch.\\n- Tuân thủ đúng các quy định hiện hành của pháp luật về quy hoạch đô thị, xây dựng và các quy định pháp luật khác có liên quan.\\n\\nII. PHẠM VI, ĐỐI TƯỢNG\\n1. Phạm vi:\\nKhu vực Hòa Khánh Bắc, phường Liên Chiểu, thành phố Đà Nẵng. Ranh giới cụ thể của khu vực quy hoạch sẽ được xác định chi tiết trong nhiệm vụ quy hoạch được phê duyệt.\\n2. Đối tượng:\\nCác tổ chức, cá nhân có liên quan đến công tác quy hoạch, quản lý, đầu tư xây dựng và phát triển đô thị trên địa bàn phường Liên Chiểu, đặc biệt là các hộ gia đình, cá nhân sinh sống và có đất đai trong phạm vi quy hoạch.\\n\\nIII. NỘI DUNG THỰC HIỆN\\n1. Giai đoạn chuẩn bị (Dự kiến từ tháng 6/2026 đến tháng 8/2026):\\n- Thành lập Tổ công tác giúp việc cho Ủy ban nhân dân phường trong công tác lập quy hoạch.\\n- Thu thập tài liệu, số liệu, khảo sát hiện trạng về điều kiện tự nhiên, kinh tế – xã hội, hạ tầng kỹ thuật, hạ tầng xã hội của khu vực quy hoạch.\\n- Lập và trình cấp có thẩm quyền phê duyệt nhiệm vụ quy hoạch chi tiết khu đô thị Hòa Khánh Bắc.\\n2. Giai đoạn lập đồ án quy hoạch (Dự kiến từ tháng 9/2026 đến tháng 6/2027):\\n- Tổ chức lựa chọn đơn vị tư vấn có đủ năng lực, kinh nghiệm để lập đồ án quy hoạch chi tiết.\\n- Tổ chức lấy ý kiến cộng đồng dân cư, các cơ quan, tổ chức có liên quan về đồ án quy hoạch theo quy định của pháp luật.\\n- Hoàn thiện đồ án quy hoạch chi tiết trên cơ sở tiếp thu ý kiến đóng góp và các quy định hiện hành.\\n3. Giai đoạn thẩm định, phê duyệt và công bố (Dự kiến từ tháng 7/2027 đến tháng 12/2027):\\n- Trình cấp có thẩm quyền thẩm định, phê duyệt đồ án quy hoạch chi tiết khu đô thị Hòa Khánh Bắc.\\n- Tổ chức công bố công khai quy hoạch đã được phê duyệt theo quy định, đảm bảo minh bạch, rộng rãi đến toàn thể nhân dân và các tổ chức liên quan.\\n- Lưu trữ hồ sơ quy hoạch theo quy định của pháp luật.\\n\\nIV. THỜI GIAN THỰC HIỆN\\nKế hoạch này dự kiến được triển khai thực hiện từ tháng 6 năm 2026 đến tháng 12 năm 2027.\\n\\nV. TỔ CHỨC THỰC HIỆN\\n1. Ủy ban nhân dân phường Liên Chiểu:\\n- Chỉ đạo chung, phân công nhiệm vụ cụ thể cho các phòng, ban, đơn vị liên quan trong quá trình triển khai Kế hoạch.\\n- Phê duyệt nhiệm vụ quy hoạch và các văn bản liên quan theo thẩm quyền.\\n- Tổ chức công bố quy hoạch sau khi được cấp có thẩm quyền phê duyệt.\\n2. Ban Quản lý đô thị phường:\\n- Là cơ quan thường trực, chủ trì, phối hợp với các đơn vị liên quan tham mưu, đề xuất các nội dung của Kế hoạch.\\n- Tham mưu lựa chọn đơn vị tư vấn, giám sát quá trình lập quy hoạch, đảm bảo chất lượng và tiến độ.\\n- Tổng hợp ý kiến đóng góp của cộng đồng và các cơ quan, tổ chức để hoàn thiện đồ án quy hoạch.\\n3. Các ban, ngành, đoàn thể phường và Tổ dân phố khu vực Hòa Khánh Bắc:\\n- Phối hợp chặt chẽ với Ban Quản lý đô thị trong quá trình triển khai Kế hoạch.\\n- Tuyên truyền, vận động nhân dân tham gia đóng góp ý kiến vào đồ án quy hoạch, tạo sự đồng thuận trong cộng đồng.\\n\\nVI. KINH PHÍ THỰC HIỆN\\nKinh phí thực hiện Kế hoạch được bố trí từ ngân sách phường và các nguồn vốn hợp pháp khác theo quy định của pháp luật. Việc quản lý, sử dụng kinh phí phải đảm bảo đúng mục đích, hiệu quả và tuân thủ các quy định hiện hành về quản lý tài chính, ngân sách nhà nước.\\nYêu cầu các phòng, ban, đơn vị liên quan và các tổ chức, cá nhân trên địa bàn phường nghiêm túc triển khai thực hiện Kế hoạch này./.\",\"noi_nhan\":[\"- Phòng Quản lý đô thị thành phố Đà Nẵng;\",\"- Đảng ủy, HĐND phường;\",\"- Các ban, ngành, đoàn thể phường;\",\"- Các tổ dân phố khu vực Hòa Khánh Bắc;\",\"- Lưu VT.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 123/KH-UBND\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":\"ỦY BAN NHÂN DÂN \\nTHÀNH PHỐ ĐÀ NẴNG\",\"chinh\":\"ỦY BAN NHÂN DÂN PHƯỜNG LIÊN CHIỂU\"},\"ten_loai\":\"KẾ HOẠCH\",\"trich_yeu\":\"Về việc quy hoạch hóa khu đô thị nông thôn mới\"}','KẾ HOẠCH','ban_nhap',1,'2026-05-21 08:43:05','2026-05-22 12:02:56'),(17,'Về việc khen thưởng sinh viên dũng cảm','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 24 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"HIỆU TRƯỞNG\",\"ho_ten\":\"Nguyễn Bảo An\"},\"noi_dung\":\"Căn cứ Luật Giáo dục số 43/2019/QH14 ngày 14 tháng 6 năm 2019;\\nCăn cứ Nghị định số 91/2017/NĐ-CP ngày 31 tháng 7 năm 2017 của Chính phủ quy định chi tiết thi hành một số điều của Luật thi đua, khen thưởng;\\nCăn cứ Quy chế công tác sinh viên của Trường Đại học Bách khoa Đà Nẵng ban hành kèm theo Quyết định số 100/QĐ-ĐHBK ngày 15 tháng 01 năm 2024 của Hiệu trưởng Trường Đại học Bách khoa Đà Nẵng;\\nXét đề nghị của Trưởng phòng Công tác Sinh viên Trường Đại học Bách khoa Đà Nẵng tại Tờ trình số 50/TTr-CTSV ngày 20 tháng 05 năm 2026,\\n\\nQUYẾT ĐỊNH:\\n\\nĐiều 1. Khen thưởng sinh viên PHAN MINH HIẾU, Mã số sinh viên 102190001, lớp 19T1, Khoa Công nghệ thông tin, Trường Đại học Bách khoa Đà Nẵng, vì đã có hành động dũng cảm cứu người đuối nước, thể hiện tinh thần tương thân tương ái, trách nhiệm với cộng đồng, góp phần lan tỏa giá trị tốt đẹp trong xã hội. Hình thức khen thưởng: Giấy khen của Hiệu trưởng và tiền thưởng 2.000.000 đồng (Hai triệu đồng chẵn).\\n\\nĐiều 2. Kinh phí khen thưởng được trích từ Quỹ khen thưởng của Trường Đại học Bách khoa Đà Nẵng.\\n\\nĐiều 3. Trưởng phòng Công tác Sinh viên, Trưởng phòng Kế hoạch - Tài chính, Thủ trưởng các đơn vị có liên quan và sinh viên PHAN MINH HIẾU chịu trách nhiệm thi hành Quyết định này./.\",\"noi_nhan\":[\"- Phòng Công tác Sinh viên;\",\"- Phòng Kế hoạch - Tài chính;\",\"- Lưu: VT, CTSV.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 123/QĐ-ĐHBK\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":null,\"chinh\":\"TRƯỜNG ĐẠI HỌC \\nBÁCH KHOA ĐÀ NẴNG\"},\"ten_loai\":\"QUYẾT ĐỊNH\",\"trich_yeu\":\"Về việc khen thưởng sinh viên dũng cảm\"}','QUYẾT ĐỊNH','cho_duyet',2,'2026-05-24 04:24:45','2026-05-24 04:25:27'),(18,'Về việc quy hoạch hóa khu đô thị Liên Chiểu','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 24 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"CHỦ TỊCH\",\"ho_ten\":\"Nguyễn Minh Hưng\"},\"noi_dung\":\"Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;\\nCăn cứ Luật Quy hoạch đô thị ngày 17 tháng 6 năm 2009;\\nCăn cứ Nghị định số 37/2010/NĐ-CP ngày 07 tháng 4 năm 2010 của Chính phủ về lập, thẩm định, phê duyệt và quản lý quy hoạch đô thị;\\nCăn cứ Quyết định số 2357/QĐ-TTg ngày 04 tháng 12 năm 2013 của Thủ tướng Chính phủ phê duyệt Điều chỉnh Quy hoạch chung thành phố Đà Nẵng đến năm 2030 và tầm nhìn đến năm 2045;\\nCăn cứ tình hình thực tiễn phát triển kinh tế - xã hội và đô thị trên địa bàn phường Liên Chiểu,\\n\\nUBND phường Liên Chiểu ban hành Kế hoạch về việc quy hoạch hóa khu đô thị Liên Chiểu như sau:\\n\\nI. MỤC ĐÍCH, YÊU CẦU\\n\\n1. Mục đích:\\n   - Nâng cao hiệu quả quản lý và sử dụng đất đai, tài nguyên, đảm bảo phát triển đô thị bền vững, đồng bộ và hiện đại.\\n   - Tạo lập không gian sống chất lượng cao, cải thiện môi trường, nâng cao tiện ích công cộng cho người dân khu vực Liên Chiểu.\\n   - Làm cơ sở pháp lý cho việc đầu tư xây dựng, chỉnh trang đô thị và thu hút các nguồn lực phát triển.\\n\\n2. Yêu cầu:\\n   - Việc quy hoạch phải đảm bảo tính khoa học, khả thi, phù hợp với quy hoạch chung của thành phố và điều kiện thực tế của phường.\\n   - Đảm bảo công khai, minh bạch, có sự tham gia rộng rãi của cộng đồng dân cư và các tổ chức xã hội trong quá trình lập và thực hiện quy hoạch.\\n   - Ưu tiên các giải pháp quy hoạch xanh, thông minh, thích ứng với biến đổi khí hậu.\\n\\nII. NỘI DUNG THỰC HIỆN\\n\\n1. Giai đoạn 1: Rà soát, đánh giá hiện trạng (Từ tháng 6/2026 đến tháng 9/2026)\\n   - Tổ chức khảo sát, thu thập dữ liệu về hiện trạng sử dụng đất, dân số, hạ tầng kỹ thuật, hạ tầng xã hội, môi trường và các yếu tố liên quan.\\n   - Đánh giá các quy hoạch đã có, xác định những tồn tại, bất cập và tiềm năng phát triển của khu vực.\\n   - Lập báo cáo đánh giá hiện trạng và đề xuất định hướng quy hoạch sơ bộ.\\n\\n2. Giai đoạn 2: Lập và điều chỉnh quy hoạch chi tiết (Từ tháng 10/2026 đến tháng 3/2027)\\n   - Xây dựng các phương án quy hoạch chi tiết, phân khu chức năng (đất ở, đất công cộng, đất cây xanh, giao thông,...) phù hợp với định hướng phát triển của phường và thành phố.\\n   - Thiết kế hệ thống hạ tầng kỹ thuật (cấp thoát nước, điện, viễn thông, xử lý chất thải) và hạ tầng xã hội (trường học, y tế, văn hóa, thể thao) đồng bộ, hiện đại.\\n   - Lập hồ sơ quy hoạch chi tiết theo đúng quy định hiện hành.\\n\\n3. Giai đoạn 3: Lấy ý kiến cộng đồng và hoàn thiện hồ sơ (Từ tháng 4/2027 đến tháng 6/2027)\\n   - Tổ chức hội nghị, hội thảo lấy ý kiến của các cơ quan, tổ chức, cá nhân và cộng đồng dân cư về các phương án quy hoạch.\\n   - Tiếp thu, tổng hợp các ý kiến đóng góp để điều chỉnh, hoàn thiện hồ sơ quy hoạch.\\n   - Trình cấp có thẩm quyền thẩm định và phê duyệt quy hoạch.\\n\\n4. Giai đoạn 4: Triển khai thực hiện và quản lý quy hoạch (Từ tháng 7/2027 trở đi)\\n   - Công bố công khai quy hoạch đã được phê duyệt theo quy định.\\n   - Tổ chức cắm mốc giới, bàn giao mốc giới quy hoạch ngoài thực địa.\\n   - Quản lý chặt chẽ việc xây dựng, đầu tư theo đúng quy hoạch đã được phê duyệt.\\n   - Định kỳ kiểm tra, đánh giá tình hình thực hiện quy hoạch và đề xuất điều chỉnh khi cần thiết.\\n\\nIII. TỔ CHỨC THỰC HIỆN\\n1. UBND phường Liên Chiểu:\\n   - Chỉ đạo chung, phân công nhiệm vụ cụ thể cho các phòng, ban, đơn vị trực thuộc và cán bộ chuyên trách.\\n   - Phê duyệt kế hoạch chi tiết, dự toán kinh phí và các văn bản liên quan.\\n   - Kiểm tra, giám sát, đôn đốc việc thực hiện Kế hoạch này.\\n   - Báo cáo định kỳ và đột xuất cho UBND thành phố Đà Nẵng về tiến độ và kết quả thực hiện.\\n2. Các ban, ngành, đoàn thể phường:\\n   - Phòng Quản lý đô thị: Là cơ quan thường trực, chủ trì tham mưu, phối hợp với các đơn vị liên quan triển khai các nội dung của Kế hoạch.\\n   - Phòng Tài chính – Kế hoạch: Tham mưu về nguồn vốn, bố trí kinh phí thực hiện Kế hoạch.\\n   - Các ban, ngành, đoàn thể khác: Phối hợp tuyên truyền, vận động nhân dân, tham gia góp ý kiến vào các nội dung quy hoạch theo chức năng, nhiệm vụ được giao.\\n3. Tổ dân phố và cộng đồng dân cư:\\n   - Tích cực tham gia góp ý kiến vào các phương án quy hoạch.\\n   - Vận động nhân dân chấp hành nghiêm chỉnh các quy định về quy hoạch và xây dựng sau khi quy hoạch được phê duyệt.\\n4. Kinh phí thực hiện:\\n   - Kinh phí thực hiện Kế hoạch được đảm bảo từ ngân sách phường và các nguồn vốn hợp pháp khác (nếu có).\\n\\nTrên đây là Kế hoạch về việc quy hoạch hóa khu đô thị Liên Chiểu. Yêu cầu các phòng, ban, đơn vị trực thuộc và các tổ chức liên quan nghiêm túc triển khai thực hiện.\",\"noi_nhan\":[\"- Thường trực Đảng ủy, HĐND phường;\",\"- Các phòng, ban, ngành, đoàn thể phường;\",\"- Các tổ dân phố trên địa bàn;\",\"- Lưu: VT, QLĐT.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 234/KH-UBND\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":\"UBND thành phố Đà Nẵng\",\"chinh\":\"UBND phường Liên Chiểu\"},\"ten_loai\":\"KẾ HOẠCH\",\"trich_yeu\":\"Về việc quy hoạch hóa khu đô thị Liên Chiểu\"}','KẾ HOẠCH','ban_nhap',2,'2026-05-24 09:10:40','2026-05-24 09:10:40'),(19,'Về việc bổ nhiệm cán bộ công chức','{\"dia_danh_thoi_gian\":\"Lệ Thủy, ngày 27 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"CHỦ TỊCH\",\"ho_ten\":\"Nguyễn Bảo Phúc\"},\"noi_dung\":\"<p>Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;</p><p>Căn cứ Luật Cán bộ, công chức năm 2008;</p><p>Căn cứ Nghị định số 138/2020/NĐ-CP ngày 27 tháng 11 năm 2020 của Chính phủ quy định về tuyển dụng, sử dụng và quản lý công chức;</p><p>Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020 của Chính phủ về công tác văn thư;</p><p>Xét đề nghị của công chức Văn phòng - Thống kê xã Lệ Thủy,</p><p></p><p style=\\\"text-align: center; font-weight: bold; margin: 16px 0;\\\">QUYẾT ĐỊNH:</p><p></p><p>Điều 1. Bổ nhiệm Ông NGUYỄN VĂN A, sinh ngày 15 tháng 8 năm 1985, giữ chức vụ công chức Văn phòng - Thống kê xã Lệ Thủy.</p><p>Ông NGUYỄN VĂN A được hưởng phụ cấp chức vụ với hệ số 0.2 theo quy định hiện hành.</p><p></p><p>Điều 2. Quyết định này có hiệu lực kể từ ngày ký.</p><p></p><p>Điều 3. Chánh Văn phòng - Thống kê xã, công chức Tài chính - Kế toán xã và Ông NGUYỄN VĂN A chịu trách nhiệm thi hành Quyết định này./.</p>\",\"noi_nhan\":[\"- Như Điều 3;\",\"- Lưu: VT.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 113/QĐ-UBND\",\"sources\":[\"Mau-quyet-dinh-bo-nhiem-can-bo-cong-chuc\",\"Mau-quyet-dinh-bo-nhiem-trong-co-quan-nha-nuoc\"],\"ten_co_quan\":{\"cap_tren\":\"UBND tỉnh Quảng Trị\",\"chinh\":\"UBND xã Lệ Thủy\"},\"ten_loai\":\"QUYẾT ĐỊNH\",\"trich_yeu\":\"Về việc bổ nhiệm cán bộ công chức\"}','QUYẾT ĐỊNH','ban_nhap',2,'2026-05-27 06:45:28','2026-05-27 07:31:08'),(20,'Về việc bổ nhiệm thành viên Liên chi đoàn','{\"dia_danh_thoi_gian\":\"Đà Nẵng, ngày 27 tháng 05 năm 2026\",\"ky_ten\":{\"chuc_vu\":\"BÍ THƯ\",\"ho_ten\":\"Phan Minh Hiếu\"},\"noi_dung\":\"<p>Căn cứ Điều lệ Đoàn Thanh niên Cộng sản Hồ Chí Minh;</p><p>Căn cứ Quy chế tổ chức và hoạt động của Liên chi đoàn Khoa Công nghệ thông tin;</p><p>Căn cứ Biên bản họp Ban Chấp hành Liên chi đoàn Khoa Công nghệ thông tin ngày 25 tháng 05 năm 2026 về việc kiện toàn nhân sự Ban Chấp hành Liên chi đoàn Khoa Công nghệ thông tin,</p><p style=\\\"text-align: center; margin: 16px 0px;\\\"><b style=\\\"\\\">QUYẾT ĐỊNH</b></p><p style=\\\"text-align: left;\\\">Điều 1. Bổ nhiệm đồng chí Lê Đức Huynh, sinh viên lớp 23T_Nhat1, mã số sinh viên 102230020, giữ chức vụ Ủy viên Ban Chấp hành Liên chi đoàn Khoa Công nghệ thông tin.</p><p style=\\\"text-align: left;\\\">Điều 2. Đồng chí Lê Đức Huynh có trách nhiệm thực hiện đầy đủ nhiệm vụ và quyền hạn của Ủy viên Ban Chấp hành Liên chi đoàn theo quy định của Điều lệ Đoàn và Quy chế hoạt động của Liên chi đoàn Khoa Công nghệ thông tin.</p><p style=\\\"text-align: left;\\\">Điều 3. Các đồng chí trong Ban Chấp hành Liên chi đoàn Khoa Công nghệ thông tin, các chi đoàn trực thuộc và đồng chí LÊ ĐỨC HUYNH chịu trách nhiệm thi hành Quyết định này.</p><p style=\\\"text-align: left;\\\"></p><p style=\\\"text-align: left;\\\">Điều 4. Quyết định này có hiệu lực kể từ ngày ký.</p>\",\"noi_nhan\":[\"- Như Điều 3;\",\"- Ban Chấp hành Liên chi đoàn Khoa Công nghệ thông tin;\",\"- Lưu VT, VP Đoàn Khoa.\"],\"quoc_hieu\":{\"dong1\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\",\"dong2\":\"Độc lập - Tự do - Hạnh phúc\"},\"so_ky_hieu\":\"Số: 352/QĐ-CNTT\",\"sources\":[],\"ten_co_quan\":{\"cap_tren\":\"KHOA CÔNG NGHỆ THÔNG TIN\",\"chinh\":\"LIÊN CHI ĐOÀN KHOA CÔNG NGHỆ THÔNG TIN\"},\"ten_loai\":\"QUYẾT ĐỊNH\",\"trich_yeu\":\"Về việc bổ nhiệm thành viên Liên chi đoàn\"}','QUYẾT ĐỊNH','ban_nhap',2,'2026-05-27 07:43:24','2026-05-27 07:43:38');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rag_documents`
--

DROP TABLE IF EXISTS `rag_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rag_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chunk_count` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `rag_documents_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rag_documents`
--

LOCK TABLES `rag_documents` WRITE;
/*!40000 ALTER TABLE `rag_documents` DISABLE KEYS */;
INSERT INTO `rag_documents` VALUES (1,'Nghị-định-30-2020-NĐ-CP.docx','docx','general','Đã index',10,2,'2026-05-23 09:13:07','2026-05-24 08:47:20'),(7,'Mau-quyet-dinh-bo-nhiem-can-bo-cong-chuc.docx','docx','quyet-dinh','Đã index',2,NULL,'2026-05-27 06:34:15','2026-05-27 06:34:25'),(8,'Mau-quyet-dinh-bo-nhiem-nhan-su.docx','docx','quyet-dinh','Đã index',1,NULL,'2026-05-27 06:34:15','2026-05-27 06:34:25'),(9,'Mau-quyet-dinh-bo-nhiem-trong-cong-ty-tnhh.docx','docx','quyet-dinh','Đã index',2,NULL,'2026-05-27 06:34:15','2026-05-27 06:34:25'),(10,'Mau-quyet-dinh-bo-nhiem-trong-cong-ty-co-phan.docx','docx','quyet-dinh','Đã index',2,NULL,'2026-05-27 06:34:15','2026-05-27 06:34:25'),(11,'Mau-quyet-dinh-bo-nhiem-trong-co-quan-nha-nuoc.docx','docx','quyet-dinh','Đã index',1,NULL,'2026-05-27 06:34:15','2026-05-27 06:34:25');
/*!40000 ALTER TABLE `rag_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Hoạt động',
  `last_login` datetime DEFAULT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','scrypt:32768:8:1$khwupHT1KyGYIZN0$bbdea216ba5edb720fbc87bbc18e8e1c778407b7e5f0fff35c741d1070239022a82a3b07defe29af13bfcffe569b3747395b8f05f5af37d964836fec7ac6d9f6','Admin','Nguyen Van Admin','2026-05-07 11:54:36','admin@qlda.gov.vn','Ban Quan tri','Hoạt động','2026-05-27 10:08:20',NULL,NULL,NULL,NULL),(2,'chuyenvien','scrypt:32768:8:1$WZdioEZJgHqf52gt$04dc2faf2f4b14f5fccca20f2070e21778186266de077aea1199ce0e5933fb6de6f9c0e070f6bbf5885d7fda16393e695cd741f624e3e955024aaf3f019f74b2','user','Nguyễn Bảo Phúc','2026-05-23 09:14:44','chuyenvien@qlda.gov.vn','Phòng Tổng hợp','Hoạt động','2026-05-27 09:53:38',NULL,NULL,'0346565071','Chuyên viên');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_steps`
--

DROP TABLE IF EXISTS `workflow_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `step_order` int NOT NULL,
  `total_steps` int DEFAULT NULL,
  `approver_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `document_id` (`document_id`),
  CONSTRAINT `workflow_steps_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_steps`
--

LOCK TABLES `workflow_steps` WRITE;
/*!40000 ALTER TABLE `workflow_steps` DISABLE KEYS */;
INSERT INTO `workflow_steps` VALUES (22,17,1,3,'Trần Minh Đức','Trưởng phòng Tổng hợp','cho_duyet',NULL,'2026-05-24 04:25:27','2026-05-24 04:25:27'),(23,17,2,3,'Nguyễn Thị Hương','Phó Giám đốc','cho_duyet',NULL,'2026-05-24 04:25:27','2026-05-24 04:25:27'),(24,17,3,3,'Lê Văn Nam','Giám đốc','cho_duyet',NULL,'2026-05-24 04:25:27','2026-05-24 04:25:27');
/*!40000 ALTER TABLE `workflow_steps` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27 17:21:40
