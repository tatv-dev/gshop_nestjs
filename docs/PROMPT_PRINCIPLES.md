## Nguyên tắc build prompt:

1. Các thành phần: core_principles, process, standard_knowledge phải không chứa techstack mà chỉ reference thông qua implementation_knowledge

2. Xây dựng bộ code template để từ đó ở các step có thể reference đến để sinh code chuẩn

3. Khi làm việc với LLM (Large Language Models) trong các tác vụ sinh code phức tạp. Nguyên nhân thường là:
- Tối ưu hóa Token: AI cố gắng tiết kiệm token bằng cách bỏ qua các file "nhỏ" (DTO) để tập trung vào các file "chính" (Handler, Controller).
- Context Overload: Prompt quá dài và logic xử lý các bước (process) bị trôi đi, AI nhảy cóc đến bước cuối cùng.
- Implicit Assumption (Giả định ngầm): AI tự cho rằng việc khai báo DTO có thể gộp chung vào file Handler (inline class) hoặc tự hiểu ngầm, thay vì tạo file riêng biệt.
- Để khắc phục triệt để, cần áp dụng chiến thuật "Blocker Dependency" (Ràng buộc chặn) và "Explicit File Output" (Yêu cầu xuất file rõ ràng).