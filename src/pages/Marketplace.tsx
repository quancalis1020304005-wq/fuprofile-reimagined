import { useState } from "react";
import { Plus, Search, MapPin, MoreVertical, Trash2, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  location: string;
  seller: string;
  sellerAvatar?: string;
  timeAgo: string;
  image?: string;
  category: string;
}

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    location: "",
    category: "electronics"
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      title: "Điện thoại Nothing Phone",
      price: 2000,
      description: "📱 Bạn muốn nổi bật mà không cần phô trương? Hãy chọn Nothing Phone – chiếc smartphone độc đáo với thiết kế trong suốt và hệ thống đèn Glyph Interface đầy ấn tượng!",
      location: "Australia",
      seller: "Lê Minh Quân",
      timeAgo: "3 ngày trước",
      image: "",
      category: "electronics"
    },
    {
      id: 2,
      title: "Camlycoin",
      price: 1000,
      description: "CAMLY COIN",
      location: "ở một nơi có năng lượng",
      seller: "camly test web",
      timeAgo: "3 ngày trước",
      image: "",
      category: "collectibles"
    }
  ]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh không được vượt quá 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleCreateProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      toast.error("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }

    setIsUploading(true);
    let imageUrl = "";

    try {
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts-media')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // For now, just add to local state (will connect to database later)
      const newProductItem: Product = {
        id: Date.now(),
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        location: newProduct.location,
        seller: "Người dùng",
        timeAgo: "Vừa xong",
        image: imageUrl,
        category: newProduct.category
      };

      setProducts([newProductItem, ...products]);
      toast.success("Đã đăng sản phẩm thành công!");
      setIsDialogOpen(false);
      setNewProduct({
        title: "",
        price: "",
        description: "",
        location: "",
        category: "electronics"
      });
      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error("Có lỗi xảy ra khi đăng sản phẩm");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success("Đã xóa sản phẩm");
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleDeleteProduct(product.id)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa sản phẩm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="aspect-square bg-muted flex items-center justify-center cursor-pointer">
        {product.image ? (
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground text-sm">Không có ảnh</div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg line-clamp-1">
            {product.title}
          </h3>
          <p className="text-2xl font-bold text-primary mt-1">
            ${product.price.toLocaleString()}
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{product.location}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={product.sellerAvatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {product.seller.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground line-clamp-1">
                {product.seller}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {product.timeAgo}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                Đăng bán
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Đăng sản phẩm mới</DialogTitle>
                <DialogDescription>
                  Tạo tin đăng bán sản phẩm của bạn
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên sản phẩm</Label>
                  <Input
                    id="title"
                    placeholder="Nhập tên sản phẩm..."
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Điện tử</SelectItem>
                        <SelectItem value="fashion">Thời trang</SelectItem>
                        <SelectItem value="home">Gia dụng</SelectItem>
                        <SelectItem value="collectibles">Sưu tầm</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    placeholder="Nhập địa điểm..."
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="resize-none min-h-[120px]"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Hình ảnh sản phẩm</Label>
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 border-dashed"
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Image className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Thêm hình ảnh</span>
                        </div>
                      </Button>
                    )}
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateProduct} disabled={isUploading} className="bg-primary hover:bg-primary/90">
                  {isUploading ? "Đang đăng..." : "Đăng bán"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="electronics">Điện tử</SelectItem>
              <SelectItem value="fashion">Thời trang</SelectItem>
              <SelectItem value="home">Gia dụng</SelectItem>
              <SelectItem value="collectibles">Sưu tầm</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
