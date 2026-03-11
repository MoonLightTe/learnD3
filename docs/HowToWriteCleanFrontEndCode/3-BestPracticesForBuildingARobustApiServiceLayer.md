# Best Practices for building a robust api service layer

## 网络请求的问题

```javascript

getUsers(){
    axios.get('/api/v1/users', {
        params: {
            page: 1,
            page_size: 10
        }
    }).then(response =>{
        if(response.status === 200 && response.data.code === 200){
            this.users = response.data.data || []
        }
    }).catch(e =>{
        alert(e.message)
        console.log(e)
    })
}
```

- url地址采取了硬编码形式访问
- 请求成功的处理逻辑会存在重复
- 请求失败的处理逻辑会存在重复，失败逻辑处理不全面
- 不应该将getUsers方法放在某个组件中
- 不应该直接调用axios进行网络请求（可能会有疑问，后面我们会讲）
