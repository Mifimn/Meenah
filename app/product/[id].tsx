// app/product/[id].tsx
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ScrollView, Platform, StatusBar, Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, SlideInDown, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Heart, Star, Minus, Plus, ShoppingCart } from 'lucide-react-native';

const { height } = Dimensions.get('window');

// --- DUMMY DATABASE ---
// In a real app, you would fetch this from Supabase or an API using the ID
const PRODUCTS_DB: Record<string, any> = {
  '1': { name: "Pink Velvet Cake", price: 12.00, rating: 4.8, reviews: 124, description: "Our signature Pink Velvet Cake is baked fresh every morning. Layers of moist, vibrant velvet sponge filled with rich vanilla cream cheese frosting. A masterpiece for your tastebuds.", image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=80' },
  '2': { name: "Strawberry Cookies", price: 8.50, rating: 4.9, reviews: 89, description: "Crunchy on the outside, incredibly chewy on the inside. Baked with real freeze-dried strawberries and premium white chocolate chips.", image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80' },
  '3': { name: "Meenah Croissants", price: 6.00, rating: 4.7, reviews: 210, description: "Flaky, buttery perfection. Hand-rolled and baked until golden brown, drizzled with our signature pink strawberry glaze.", image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80' }
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams(); // Gets the ID from the URL
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const product = PRODUCTS_DB[id as string] || PRODUCTS_DB['1']; // Fallback to product 1
  
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Button animation for the Add to Cart press
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const handleAddToCart = () => {
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
    // Here you would normally dispatch to Redux, Zustand, or Context API
    console.log(`Added ${quantity} ${product.name} to cart! Total: $${(product.price * quantity).toFixed(2)}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* --- HERO IMAGE HEADER --- */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.imageOverlay} />
          
          {/* Frosted Glass Top Navigation */}
          <View style={[styles.topNav, { paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 10 }]}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <BlurView intensity={40} tint="dark" style={styles.glassButton}>
                <ArrowLeft size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} activeOpacity={0.7}>
              <BlurView intensity={40} tint="dark" style={styles.glassButton}>
                <Heart size={24} color={isFavorite ? "#EF4444" : "#fff"} fill={isFavorite ? "#EF4444" : "transparent"} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- PRODUCT DETAILS CONTENT --- */}
        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={[styles.detailsContainer, { backgroundColor: theme.background }]}>
          
          <View style={styles.titleRow}>
            <Text style={[styles.productTitle, { color: theme.text }]}>{product.name}</Text>
            <Text style={[styles.productPrice, { color: theme.primary }]}>${product.price.toFixed(2)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text style={[styles.ratingText, { color: theme.text }]}>{product.rating}</Text>
            <Text style={[styles.reviewsText, { color: theme.icon }]}>({product.reviews} reviews)</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.surface }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: theme.icon }]}>{product.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Quantity</Text>
            <View style={[styles.quantityControls, { backgroundColor: theme.surface }]}>
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))} 
                style={styles.quantityBtn}
              >
                <Minus size={20} color={theme.text} />
              </TouchableOpacity>
              
              <Text style={[styles.quantityNumber, { color: theme.text }]}>{quantity}</Text>
              
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)} 
                style={styles.quantityBtn}
              >
                <Plus size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* --- FROSTED GLASS BOTTOM CART BAR --- */}
      <Animated.View entering={SlideInDown.duration(600).delay(400)} style={styles.bottomCartBar}>
        <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <View style={styles.cartContent}>
          <View>
            <Text style={[styles.totalLabel, { color: theme.icon }]}>Total Price</Text>
            <Text style={[styles.totalPrice, { color: theme.text }]}>${(product.price * quantity).toFixed(2)}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={handleAddToCart}>
            <Animated.View style={[styles.addToCartBtn, { backgroundColor: theme.primary }, animatedButtonStyle]}>
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { width: '100%', height: height * 0.45, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' }, // Darkens image slightly for white text readability
  
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, zIndex: 10 },
  glassButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  
  detailsContainer: { flex: 1, marginTop: -30, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productTitle: { fontSize: 26, fontWeight: '900', flex: 1, marginRight: 10 },
  productPrice: { fontSize: 24, fontWeight: '900' },
  
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  ratingText: { fontSize: 16, fontWeight: 'bold' },
  reviewsText: { fontSize: 14, fontWeight: '500' },
  
  divider: { height: 1, width: '100%', opacity: 0.5, marginBottom: 20 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { fontSize: 15, lineHeight: 24, marginBottom: 30 },
  
  quantityContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, paddingHorizontal: 6, paddingVertical: 6 },
  quantityBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center' },
  quantityNumber: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20 },

  bottomCartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 110 : 90, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  cartContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  totalLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  totalPrice: { fontSize: 22, fontWeight: '900' },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 30, elevation: 5, shadowColor: '#FF69B4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
