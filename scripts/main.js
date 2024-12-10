//上下图获取按钮元素
var prevImageButton = document.getElementById("prevImage");
var nextImageButton = document.getElementById("nextImage");

// 为"上一张图"按钮绑定点击事件
prevImageButton.onclick = function () {
  if (imgInd > 0) {
    imgInd--;
    openIndIm();
  } else {
    alert("已经是第一张图片");
  }
};

// 为"下一张图"按钮绑定点击事件
nextImageButton.onclick = function () {
  if (imgInd < imgFiles.length - 1) {
    //        saveObjs()
    imgInd++;
    openIndIm();
  } else {
    alert("已经是最后一张图片");
  }
};

// 为整个文档添加键盘事件监听器 a:上一张 d:下一张 s:确认标注框 c:清空当前图片标注 f:完成图片标注
document.addEventListener("keydown", function (event) {
  if (event.key === "a") {
    prevImageButton.click();
  } else if (event.key === "d") {
    nextImageButton.click();
  } else if (event.key === "s") {
    if (!comfirmBox()) {
      alert("未选择目标区域！");
    }
  } else if (event.key === "c") {
    image.objects = [];
    show_origin_img();
    localStorage.removeItem(image.name);
  } else if (event.key === "f") {
    saveObjs();
  }
});

//////////////////////////////////////////////
//                 处理标注结果             //
//////////////////////////////////////////////
function resetDataNewim() {
  // 不要清除 image.objects
  resetDataNewobj();
}

function resetDataNewobj() {
  color = obj.labelColor;
  lab = obj.label;
  obj = new Object();
  obj.labelColor = color;
  obj.label = lab;
}

/*确认标注结果*/
var comfirmBoxBtn = document.getElementById("boxDone");
comfirmBoxBtn.onclick = function () {
  if (!comfirmBox()) {
    alert("未选择目标区域！");
  }
};

function comfirmBox() {
  if ("w" in obj && obj.w != 0) {
    xmin = obj.x;
    ymin = obj.y;
    xmax = xmin + obj.w;
    ymax = ymin + obj.h;

    pmin = canXYtoImageXY(image, xmin, ymin);
    obj.xmin = pmin[0];
    obj.ymin = pmin[1];
    pmax = canXYtoImageXY(image, xmax, ymax);
    obj.xmax = pmax[0];
    obj.ymax = pmax[1];
    
    // 创建新对象以避免引用问题
    const newObj = {
      label: obj.label,
      labelColor: obj.labelColor,
      xmin: obj.xmin,
      ymin: obj.ymin,
      xmax: obj.xmax,
      ymax: obj.ymax
    };
    
    image.objects.push(newObj);
    
    // 立即保存到 localStorage
    saveToLocalStorage();
    
    show_origin_img();
    return true;
  }
  return false;
}

// 添加新的函数用于保存到 localStorage
function saveToLocalStorage() {
  const imRes = {
    imgName: image.name,
    "img-w": image.width,
    "img-h": image.height,
    objs: image.objects
  };
  localStorage.setItem(image.name, JSON.stringify(imRes));
}

/*完成标注图片*/
var toJson = document.getElementById("imDone");
toJson.onclick = function () {
  saveObjs();
};

/*保存标注结果*/
var zip = new JSZip();
var savedFiles = []; // 用于存储已保存的文件名

function saveObjs() {
  num = image.objects.length;
  if (num == 0) {
    alert("未进行任何标注");
    return;
  }
  var objs = [];
  for (i = 0; i < num; i++) {
    target = image.objects[i];
    console.log(target.label);
    ob = {
      label: target.label,
      labelColor: target.labelColor,
      xmin: parseInt(target.xmin),
      xmax: parseInt(target.xmax),
      ymin: parseInt(target.ymin),
      ymax: parseInt(target.ymax),
    };
    objs.push(ob);
  }
  //保存图片宽和高到json文件
  imRes = {
    imgName: image.name,
    "img-w": image.width,
    "img-h": image.height,
    objs: objs,
  };

  blob = new Blob([JSON.stringify(imRes)], { type: "" });
  name = image.name.split(".")[0];
  jsonFile = name + ".json";
  // 将标注数据存储到localStorage
  localStorage.setItem(image.name, JSON.stringify(imRes));

  // 将文件添加到savedFiles数组中
  savedFiles.push({ name: jsonFile, data: JSON.stringify(imRes) });
  console.log("Saved annotation for: " + image.name); // 添加日志
  imgInd += 1;
  openIndIm();
}

// 保存所有标注
document.getElementById("saveAllAnnotations").onclick = function () {
  // 检查是否有保存的文件
  if (savedFiles.length === 0) {
    // 检查 localStorage 中是否有标注数据
    let hasAnnotations = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('.jpg') || key.includes('.png') || key.includes('.jpeg')) {
        const data = localStorage.getItem(key);
        const jsonData = JSON.parse(data);
        if (jsonData.objs && jsonData.objs.length > 0) {
          hasAnnotations = true;
          const jsonFile = key.split('.')[0] + '.json';
          savedFiles.push({ name: jsonFile, data: data });
        }
      }
    }
    
    if (!hasAnnotations) {
      alert("没有保存的标注文件！");
      return;
    }
  }

  // 将每个保存的文件添加到ZIP文件中
  savedFiles.forEach(function (file) {
    zip.file(file.name, file.data);
  });

  // 生成ZIP文件并提���给用户下载
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "annotations.zip");
  });

  //下载完清空所有本地储存的标注
  // 只清除图片标注相关的数据，保留其他设置
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key.includes('.jpg') || key.includes('.png') || key.includes('.jpeg')) {
      localStorage.removeItem(key);
    }
  }
  savedFiles = []; // 清空已保存文件列表
};

/*保存json文件（没用上）*/
function saveJson(file, data) {
  //下载为json文件
  var Link = document.createElement("a");
  Link.download = file;
  Link.style.display = "none";
  // 字符内容转变成blob地址  为Blob对象创建一个新的URL，并将这个URL设置为链接的href属性。
  Link.href = URL.createObjectURL(data);
  // 这两行代码首先将链接元素添加到页面的body中，然后模拟用户点击这个链接，从而触发文件下载。
  document.body.appendChild(Link);
  Link.click();
  // 然后移除
  document.body.removeChild(Link);
}

/*重新标注图片*/
var Imreset = document.getElementById("resetIm");
Imreset.onclick = function () {
  image.objects = [];
  show_origin_img();
  localStorage.removeItem(image.name);
};

//////////////////////////////////////////////
//                 canvas相关               //
//////////////////////////////////////////////
var canvas = document.querySelector(".Imcanvas");
var canW = canvas.width;
var canH = canvas.height;
var ctx = canvas.getContext("2d");
ctx.lineWidth = 3;
flush_canvas();

/////////////////////Bbox 绘制////////////////
var p1 = new Object(),
  p2 = new Object(),
  flag_drawBbox = false;
canvas.onmousedown = function (e) {
  if (e.button == 0) {
    if (flag_drawBbox == false) {
      flag_drawBbox = true;
      p1.x = e.offsetX > image.canx ? e.offsetX : image.canx;
      p1.x = p1.x < image.canx + image.canw ? p1.x : image.canx + image.canw;
      p1.y = e.offsetY > image.cany ? e.offsetY : image.cany;
      p1.y = p1.y < image.cany + image.canh ? p1.y : image.cany + image.canw;
    } else {
      flag_drawBbox = false;
    }
  }
};
canvas.onmousemove = function (e) {
  if (flag_drawBbox) {
    p2.x = e.offsetX > image.canx ? e.offsetX : image.canx;
    p2.x = p2.x < image.canx + image.canw ? p2.x : image.canx + image.canw;
    p2.y = e.offsetY > image.cany ? e.offsetY : image.cany;
    p2.y = p2.y < image.cany + image.canh ? p2.y : image.cany + image.canw;
    obj.x = Math.min(p1.x, p2.x);
    obj.y = Math.min(p1.y, p2.y);
    obj.w = Math.abs(p1.x - p2.x);
    obj.h = Math.abs(p1.y - p2.y);
    show_image(image);
    ctx.strokeStyle = obj.labelColor;
    ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
  }
  // 清除之前的虚线
  ctx.clearRect(0, 0, canW, canH);
  show_image(image); // 假设这是显示图像的函数

  // 制十字虚线
  ctx.setLineDash([1, 1]); // 设置虚线样式
  ctx.strokeStyle = "black"; // 设置虚线颜色
  ctx.beginPath();
  ctx.moveTo(e.offsetX, 0);
  ctx.lineTo(e.offsetX, canH);
  ctx.moveTo(0, e.offsetY);
  ctx.lineTo(canW, e.offsetY);
  ctx.stroke();
  ctx.setLineDash([]);
  // 显示Bbox
  ctx.strokeStyle = obj.labelColor;
  ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
};

//展示索引
var currentImageIndex = 0; // 当前图像的索引
var totalImages = 0; // 总的图像数量

function updateImageStatus() {
  var statusDiv = document.getElementById("imageStatus");
  statusDiv.textContent =
    "当前图像: " + (currentImageIndex + 1) + " / " + totalImages;
}

////////////////////打开图片//////////////////////////////
var imgName, imgFiles, imgInd;
var imgsUploader = document.getElementById("imgSelector");
imgsUploader.onchange = function (e) {
  imgFiles = imgsUploader.files;
  // 获取所有图片数量
  totalImages = imgFiles.length;
  imgInd = parseInt(localStorage.getItem("imgInd"));
  if (imgInd == null || !imgFiles.hasOwnProperty(imgInd)) {
    imgInd = 0;
    localStorage.setItem("imgInd", imgInd);
  }
  openIndIm();

  // 显示图片名列表
  updateImageList(); // 新增这一行
};

// 新增一个函数来更新图片列表
function updateImageList() {
  var imageListDiv = document.getElementById("imageList");
  imageListDiv.innerHTML = ""; // 清空列表

  for (var i = 0; i < imgFiles.length; i++) {
    // 展示图片名
    var imgNameDiv = document.createElement("div");
    imgNameDiv.innerText = imgFiles[i].name;
    imageListDiv.appendChild(imgNameDiv);
  }
}

function openIndIm() {
  if (imgInd < imgFiles.length) {
    const file = imgFiles[imgInd];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      image.src = e.target.result;
      image.name = file.name;
      document.getElementById("imageNameDisplay").innerText = file.name;
      
      // 更新当前标注图片索引
      currentImageIndex = imgInd;
      updateImageStatus();
      
      // 从 localStorage 加载标注数据
      const storedData = localStorage.getItem(image.name);
      if (storedData) {
        const imRes = JSON.parse(storedData);
        image.objects = imRes.objs || [];
      } else {
        image.objects = [];
      }
      
      resetDataNewobj();
      show_origin_img();
      localStorage.setItem("imgInd", imgInd);
    };
    
    reader.readAsDataURL(file);
  } else {
    alert("已经处理完所有图片");
    resetDataNewim();
  }
}

var jsonsUploader = document.getElementById("jsonFolderInput");
jsonsUploader.onchange = function (e) {
  var files = jsonsUploader.files;
  var reader = new FileReader();
  var fileIndex = 0;

  function readFile() {
    if (fileIndex >= files.length) return;

    var file = files[fileIndex];
    if (file.name.endsWith(".json")) {
      reader.onload = function (e) {
        var content = e.target.result;
        try {
          var jsonData = JSON.parse(content);
          // 处理 jsonData
          localStorage.setItem(jsonData.imgName, content);
          console.log(jsonData);
        } catch (error) {
          console.error("Error parsing JSON from", file.name, ":", error);
        }
        fileIndex++;
        readFile(); // 递归读取下一个文件
      };
      reader.readAsText(file);
    } else {
      fileIndex++;
      readFile(); // 如果不是 JSON 文件，跳过并读取下一个文件
    }
  }

  readFile(); // 开始读取第一个文件
};

let gotoBut = document.getElementById("gotoIm");
gotoBut.onclick = function () {
  imgNameGoto = prompt("请输入图片名");
  for (i = 0; i < imgFiles.length; i++) {
    if (imgFiles[i].name == imgNameGoto) {
      imgInd = i;
      openIndIm();
      resetDataNewim();
      show_origin_img();
      return;
    }
  }
  alert("没有找到图片：" + imgNameGoto);
};

/////////////////////图像绘制放大///////////
var image = new Image();
image.src = "./welcome.png";
image.objects = [];
image.onload = show_origin_img;
canvas.ondblclick = function (e) {
  e = window.event || event;
  enlargeIm(e, image);
};

canvas.oncontextmenu = function (e) {
  e.preventDefault();
};
canvas.onmouseup = function (e) {
  e = window.event || event;
  if (e.button == 2) {
    show_origin_img();
  }
};

/*双击放大图片*/
function enlargeIm(e, img) {
  e = window.event || event;
  mouseX = e.offsetX;
  mouseY = e.offsetY;
  console.log("canvasX: " + mouseX + " canvasY: " + mouseY);
  if (canXYonImage(mouseX, mouseY)) {
    imgXY = canXYtoImageXY(img, mouseX, mouseY);
    img.focusX = imgXY[0];
    img.focusY = imgXY[1];
    img.sizek *= 1.5;
    // console.log(img.sizek)
    resetDataNewobj();
    show_image(img);
  }
}

/*获取canvas上一个点对应原图像的点*/
function canXYtoImageXY(img, canx, cany) {
  k = 1 / img.sizek;
  imgx = (canx - img.canx) * k + img.cutx;
  imgy = (cany - img.cany) * k + img.cuty;
  return [imgx, imgy];
}

/*图像上的点对应的canvas坐标*/
function imageXYtoCanXY(img, x, y) {
  x = (x - img.cutx) * img.sizek + img.canx;
  y = (y - img.cuty) * img.sizek + img.cany;
  return [x, y];
}

/*判断点是否在image上*/
function canXYonImage(x, y) {
  if (x > image.canx && x < image.canx + image.canw) {
    if (y > image.cany && y < image.cany + image.canh) {
      return true;
    }
  } else {
    return false;
  }
}

/*在canvas上展示原图片*/
function show_origin_img() {
  flush_canvas();
  imW = image.width;
  imH = image.height;
  k = canW / imW;
  if (imH * k > canH) {
    k = canH / imH;
  }
  image.sizek = k;
  image.focusX = imW / 2;
  image.focusY = imH / 2;

  resetDataNewobj();
  show_image(image);
}

/*涂黑画布*/
function flush_canvas() {
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canW, canH);
}

/*在canvas上显示已标注目标*/
function show_objects(img) {
  for (i = 0; i < img.objects.length; i++) {
    target = img.objects[i];
    x = target.xmin;
    y = target.ymin;
    xm = target.xmax;
    ym = target.ymax;

    p = imageXYtoCanXY(img, x, y);
    x = p[0];
    y = p[1];
    p = imageXYtoCanXY(img, xm, ym);
    xm = p[0];
    ym = p[1];
    drwa_line(img, x, y, x, ym, target.labelColor);
    drwa_line(img, x, y, xm, y, target.labelColor);
    drwa_line(img, xm, y, xm, ym, target.labelColor);
    drwa_line(img, x, ym, xm, ym, target.labelColor);
  }
}

/*在canvas的图像上画直线*/
function drwa_line(img, x1, y1, x2, y2, color) {
  if (x1 == x2 && x1 > img.canx && x1 < img.canx + img.canw) {
    if (y1 < img.cany) {
      y1 = img.cany;
    }
    if (y1 > img.cany + img.canh) {
      y1 = img.cany + img.canh;
    }
    if (y2 < img.cany) {
      y2 = img.cany;
    }
    if (y2 > img.cany + img.canh) {
      y2 = img.cany + img.canh;
    }
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  } else {
    if (y1 == y2 && y1 > img.cany && y1 < img.cany + img.canh) {
      if (x1 < img.canx) {
        x1 = img.canx;
      }
      if (x1 > img.canx + img.canw) {
        x1 = img.canx + img.canw;
      }
      if (x2 < img.canx) {
        x2 = img.canx;
      }
      if (x2 > img.canx + img.canw) {
        x2 = img.canx + img.canw;
      }
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    }
  }
}

/*在canvas上展示图像对应的部分*/
function show_image(img) {
  flush_canvas();
  imgWK = img.width * img.sizek;
  imgHK = img.height * img.sizek;
  if (canW > imgWK) {
    img.cutx = 0;
    img.canx = (canW - imgWK) / 2;
    img.cutw = img.width;
    img.canw = imgWK;
  } else {
    img.canx = 0;
    img.canw = canW;
    lenIm = canW / img.sizek;
    img.cutw = lenIm;
    xl = img.focusX - lenIm / 2;
    xr = img.focusX + lenIm / 2;
    img.cutx = xl;
    if (xl < 0) {
      img.cutx = 0;
    }
    if (xr >= img.width) {
      img.cutx = xl - (xr - img.width + 1);
    }
  }

  if (canH > imgHK) {
    img.cuty = 0;
    img.cany = (canH - imgHK) / 2;
    img.cuth = img.height;
    img.canh = imgHK;
  } else {
    img.cany = 0;
    img.canh = canH;
    lenIm = canH / img.sizek;
    img.cuth = lenIm;
    yu = img.focusY - lenIm / 2;
    yd = img.focusY + lenIm / 2;
    img.cuty = yu;
    if (yu < 0) {
      img.cuty = 0;
    }
    if (yd >= img.height) {
      img.cuty = yu - (yd - img.height + 1);
    }
  }
  ctx.drawImage(
    img,
    img.cutx,
    img.cuty,
    img.cutw,
    img.cuth,
    img.canx,
    img.cany,
    img.canw,
    img.canh
  );
  show_objects(img);
}

//////////////////////////////////////////////
//           手动更改label相关              //
//////////////////////////////////////////////
//这里首先创建了一个新的对象 obj。然后，使用 jQuery 选择当前被选中的单选按钮 (inputDBL) 和与其关联的标签 (labelDBL)。
//接着，将这些值存储在 obj 对象中。
var obj = new Object();
var inputDBL = $("input[name=label]:checked");
var labelDBL = $('label[for="' + inputDBL.attr("id") + '"]');
obj.label = inputDBL.val();
obj.labelColor = $('label[for="' + inputDBL.attr("id") + '"]')
  .attr("style")
  .split(" ")[1];

//这部分代码为具有 .Label 类的元素添加了一个单击事件。当用户点击这个元素时，会检查是否选择了新的单选按钮，
//并相应地更新 obj 对象的值。然后它会显示图像并在图像上绘制一个矩形，矩形的颜色与选中的标签的颜色相同。
var LabelSelector = document.querySelector(".Label");
LabelSelector.onclick = function () {
  inputDBL = $("input[name=label]:checked");
  tmp = inputDBL.val();
  if (tmp == obj.label) return;
  obj.label = tmp;
  obj.labelColor = $('label[for="' + inputDBL.attr("id") + '"]')
    .attr("style")
    .split(" ")[1];
  show_image(image);
  ctx.strokeStyle = obj.labelColor;
  ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
};
//这部分代码为具有 .Label 类的元素添加了一个双击事件。用户双击这个元素时，会弹出一个提示框，让用户输入新的类别名称。
//然后，它会更新 obj 对象的值，并将新的类别名称保存在本地存储中。
LabelSelector.ondblclick = function () {
  inputDBL = $("input[name=label]:checked");
  labelDBL = $('label[for="' + inputDBL.attr("id") + '"]');

  inp = prompt("请输入该类的名称");
  if (inp == "" || inp == null) {
    console.log("输入为空");
    return;
  }
  obj.label = inp;
  obj.labelColor = labelDBL.attr("style").split(" ")[1];
  labelDBL.text(obj.label);
  inputDBL.attr("value", obj.label);

  labelID = labelDBL.attr("id");
  localStorage.setItem(labelID, obj.label);
};

//////////////////////////////////////////////
//           加载历史信息                   //
//////////////////////////////////////////////
// let loadBut = document.getElementById('loadLocal');
loadLocalData();
// loadBut.onclick = loadLocalData;

function loadLocalData() {
  console.log("加载历史信息");
  labels = $("label.InputLabel");
  for (i = 0, len = labels.length; i < len; i++) {
    labeli = labels[i];
    labelID = labeli.id;
    name = localStorage.getItem(labelID);
    if (name != "null") {
      labelI = $("label#" + labelID);
      labelI.text(name);
      inpID = labeli.getAttribute("for");
      inp = $("input#" + inpID);
      inp.attr("value", name);
    }
  }
}
