# cra-template-typescript-php

Задача - автоматизировать включение SPA приложений, собранных с помощью CRA, в качестве фрагментов/виджетов в страницы сайта на bitrix. Готовых решений в интернете не нашлось, максимум, что предлагается - сделать eject и далее править конфиги webpack.
Вариант так себе, не очень. В дальнейшем сопровождать и масштабировать замучаешься.

Здесь нам понадобится пакет [@craco/craco](https://github.com/dilanx/craco) для переопределения стандартной конфигурации CRA. Чтобы все стало совсем уж заавтоматизированно, пришлось сделать свой кастомный шаблон на базе [cra-template-typescript](https://github.com/facebook/create-react-app/tree/main/packages/cra-template-typescript).

## Установка и настройка

`npx create-react-app my-app --template git+https://git@github.com/alex461919/cra-template-typescript-php.git`

### `npm run start`

Работает в стандартном режиме. Если приложение обменивается данными с бэкендом по REST, то проблем при отладке не будет.

### `npm run build`

Сборка в production режиме в соответствии с настройками.

### Настройки в файле `.env`

Папка сайта, куда будут сложены скрипты, стили и php страница с внедренными элементами link и script.  
`BUILD_PATH=/var/www/site/section/page`

Путь для загрузки скриптов и стилей, но тут, смотря как их внедрять. Важно, если используется BrowserRouter.  
`PUBLIC_URL=/`

Не нужен нам souce map.  
`GENERATE_SOURCEMAP=false`

Исходный шаблон страницы в папке src, куда будем внедрять скрипты. Не обязательно именно php файл, можно и другой тип.  
`APP_TEMPLATE=index.php`

### Внедрение скриптов в шаблон

#### Стандартный для HtmlWebpackPlugin пример:

```html
<% for (var item in htmlWebpackPlugin.files.css) { %>
<link
  href="<%= htmlWebpackPlugin.files.css[item] %>"
  type="text/css"
  rel="stylesheet"
/>
<% } %> <% for (var item in htmlWebpackPlugin.files.js ) { %>
<script defer src="<%= htmlWebpackPlugin.files.js[item] %>"></script>
<% } %>
```

PUBLIC_URL должен быть корректно прописан.

#### Если это страница битрикса, можно так:

```php
$dir=substr(__DIR__, strlen($_SERVER['DOCUMENT_ROOT']));
<% for (var item in htmlWebpackPlugin.files.css) { %>
    Asset::getInstance()->addCss($dir . "<%= htmlWebpackPlugin.files.css[item] %>");
<% } %>
<% for (var item in htmlWebpackPlugin.files.js ) { %>
    Asset::getInstance()->addJs($dir .  "<%= htmlWebpackPlugin.files.js[item] %>");
<% } %>
```

PUBLIC_URL не обязателен. Путь задается относительно места расположения **файла**. Не страницы, т.к. это может быть и включаемый компонент.
