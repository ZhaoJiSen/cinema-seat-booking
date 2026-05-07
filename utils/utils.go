package utils

import (
	"encoding/json"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, status int, v any) {
	// w.Header().Set 是设置响应头
	w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(statusCode) 是设置响应状态码
	w.WriteHeader(status)

	// 这个地方是把 v 这个数据编码成 JSON 格式，并写入到 w 中，作为响应体返回给客户端
	// 调用 Encode 会自动调用 w.Write()
	json.NewEncoder(w).Encode(v)
}
