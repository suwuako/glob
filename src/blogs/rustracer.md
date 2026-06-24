# Outputting an image
Lets first output an image - the book reccomends using a ppm since you can just print to
stdout, but why should I when I can have the `bmp` crate already do it for me?    
&nbsp;  
Lets just do a cheeky `cargo add bmp` and steal the example code from the `bmp` page:

```rust
#[macro_use]
extern crate bmp;
use bmp::{Image, Pixel};

fn main() {
    let mut img = Image::new(256, 256);

    for (x, y) in img.coordinates() {
        img.set_pixel(x, y, px!(x, y, 200));
    }
    let _ = img.save("img.bmp");
}
```

A few things - I don't want the bmp macros, so I'll be deleting lines 1 and 2 and
replacing
&nbsp;
`px!(x, y, 200)` with `Pixel::new()`. However, this
leads to a new issue where `(x, y)` are are a tuple of `u32`s whereas if we look at the
constructor for `Pixel` [2], we will see that its defined as:

```rust
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}
```

The rust compiler (rightfully so) is unhappy about this... We're tossing in a u32 into a
function that takes in a u8, which would mean we lose 24 bits of precision when we cast
down! Rust sees this and decides to warn us, but if we explicitly cast the `u32 as u8`,
then the compiler stops complaining:

```rust
img.set_pixel(x, y, Pixel::new(x as u8, y as u8, 200));
```

Lets try running this with `cargo run`, and lo-and-behold: 

```bash
❯ cargo run
   Compiling rustracer v0.1.0 (/home/sw/git/rustracer)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.08s
     Running `target/debug/rustracer`
~/git/rustracer main* ⇡                                                    pyvenv 06:50:50 PM
```

Wonderful! Lets check out the image to see what it looks like:

![babys first bmp](/public/rustracer/output-an-image.bmp "the bmp in question")

But wait - we've glazed over a few things... We've informed the compiler that "yes, we do
want to lose 24 bits of precision", but we've never actually lost precision here - our
image here is `256x256`, and the largest value a u8 can store is also `256`! So what
happens if we cast and lose precision?     
Lets write a little sample program to test what happens with overflow...

```rust
fn main() {
    let meow: u32 = 1365;
    let cast: u8 = meow as u8;

    println!("meow: {}, cast: {}", meow, cast);
}
```

output:
```bash
meow: 1365, cast: 85
```

As expected, if we cast from a `u32` to a `u8`, it'll just trim off the top `24` bits!
Just to be sure, lets cast the two ints in python and see their outcomes:

```python
❯ python
>>> bin(1365)
'0b10101010101'
>>> bin(85)
    '0b1010101'
>>>
```

Okay cool - we know casting behaviour now! What if we want the compiler to warn us when
the casting process loses preccision though? This seems a bit risky if we cast, lost
precision for something incredibly important - imagine we're writing a program to
calculate the dosage of radiation to shoot for a chemotherapy machine... losing precision
here would be detrimental! How do we handle this?

Lets take a look at the rust stdlib: [3] [4]

Theres two useful traits that rust offers here: `TryInto`[3] and `TryFrom`[4]

`TryInto` is pretty simple: If you have a variable, you can call the method `try_into()`
on our variable, which returns a `Result<T, err>`: if your casting succeeds, then you get
`T`, otherwise you get the error!

```rust
fn main() {
    let var: i64 = 434324493820409328;
    let var2: i64 = 1234;
    let cast_var: Result<i32, _> = var.try_into();
    let cast_var2: Result<i32, _> = var2.try_into();

    match cast_var {
        Ok(s) => println!("{}", s),
        Err(_)   => println!("failed to cast... "),
    }

    match cast_var2 {
        Ok(s) => println!("{}", s),
        Err(_)   => println!("failed to cast... "),
    }
}
```

```bash
failed to cast... 
1234
```

Great! Theres more to it: `TryFrom` is a equivalent trait that when implement, provides
`TryInto` thanks to derive magic!

## The next part (vectors)

With graphics programming, we need vectors. If you don't know what a vector is, its just a
line in space with a direction (where is it pointing?) and magnitude (how long it is).

![example 3d vector](/public/rustracer/3d-vector-example.gif)

In our case, our raytracer handles rays (which are just vectors) in three dimensions, so
we can just create a `struct Vec3` with helpful methods that makes life much easier for
us:
- `mag`(nitude) method
- overloading `mul` to be dot product
- overloading `add`
- overloading `sub`

### Creating the `Vec3` first!

Lets create a file in `src` called `vectors.rs`:
```bash
.
├── Cargo.lock
├── Cargo.toml
├── img.bmp
├── src
│   ├── main.rs
│   └── vectors.rs
├── tags
```

and create our struct `Vec3`...

```rust
pub struct Vec3 {
    x: f64,
    y: f64,
    z: f64,
}

impl Vec3 {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Vec3 {x, y, z}
    }
}
```

We've created our struct, with a way to initialise our `Vec3` with `Vec3::new(x, y, z)`.
Lets change main to match this:

```rust
mod vectors;

//use bmp::{Image, Pixel};
use vectors::Vec3;

fn main() {
    let myvec = Vec3::new(3.0, 3.0, 3.0);
    println!("mag: {}", myvec.mag());
}
```

Great! Now that we've got vectors running, lets implment all the fun stuff :D

### implmenting add, subtract, scalar multiplication and division

Lets first implement add:

```rust
impl std::ops::Add for Vec3 {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        Self {
            x: self.x + other.x,
            y: self.y + other.y,
            z: self.z + other.z,
        }
    }

}
```

...and test it out!

```rust
mod vectors;

//use bmp::{Image, Pixel};
use vectors::Vec3;

fn main() {
    let v1 = Vec3::new(3.0, 3.0, 3.0);
    let v2 = Vec3::new(1.0, 2.0, 3.0);
    println!("v1: {}, v2: {}", v1, v2);

    let v3 = v1 + v2;
    println!("v3: {}", v3);
}
```

For those more astute, you may have noticed that the add function actually takes ownership
of both self and other - that means that this snippet of code here would actually fail!

```rust
❯ cargo run
   Compiling rustracer v0.1.0 (/home/suwa/git/rustracer)
error[E0382]: borrow of moved value: `v1`
  --> src/main.rs:13:32
   |
 7 |     let v1 = Vec3::new(3.0, 3.0, 3.0);
   |         -- move occurs because `v1` has type `Vec3`, which does not implement the `Copy` trait
...
11 |     let v3 = v1 + v2;
   |              ------- `v1` moved due to usage in operator
12 |     println!("v3: {}", v3);
13 |     println!("v1: {}, v2: {}", v1, v2);
   |                                ^^ value borrowed here after move
```

Now, we could do this with references but that would also mean having to type annoying
syntax like `v3 == &v1 ++ &v1`. Instead, lets just `#derive` `Copy, Clone` on `Vec3`, and
now every time we call a function on `Vec3`, it should create a deep copy!

```rust
#[derive(Copy, Clone)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

```

```rust
❯ cargo run
   Compiling rustracer v0.1.0 (/home/suwa/git/rustracer)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.07s
     Running `target/debug/rustracer`
v1: x: 3, y: 3 z: 3, v2: x: 1, y: 2 z: 3
v3: x: 4, y: 5 z: 6
v1: x: 3, y: 3 z: 3, v2: x: 1, y: 2 z: 3
```

We could stop here, but we've got a few nice convenient traits to add (namely `+=`, which
is `AddAssign`, `-=`, `*=` and `/=`). I won't go into tooo much depth since this is pretty
self-explanitory.

```rust
impl std::ops::AddAssign for Vec3 {
    fn add_assign(&mut self, rhs: Self) {
        self.x += rhs.x;
        self.y += rhs.y;
        self.z += rhs.z;
    }
}

impl std::ops::SubAssign for Vec3 {
    fn sub_assign(&mut self, rhs: Self) {
        self.x -= rhs.x;
        self.y -= rhs.y;
        self.z -= rhs.z;
    }
}

impl std::ops::MulAssign<f64> for Vec3 {
    fn mul_assign(&mut self, rhs: f64) {
        self.x *= rhs;
        self.y *= rhs;
        self.z *= rhs;
    }
}

impl std::ops::DivAssign<f64> for Vec3 {
    fn div_assign(&mut self, rhs: f64) {
        self.x /= rhs;
        self.y /= rhs;
        self.z /= rhs;
    }
}
```

and to make sure it works:

```rust
mod vectors;

//use bmp::{Image, Pixel};
use vectors::Vec3;

fn main() {
    let mut v1 = Vec3::new(3.0, 3.0, 3.0);
    let v2 = Vec3::new(1.0, 2.0, 3.0);
    println!("v1: {}, v2: {}", v1, v2);

    let v3 = v1 + v2;
    v1 += v2;

    println!("v3: {}", v3);
    println!("v1 + v2: {}", v1);
    v1 *= 2.0;
    println!("v1 * 2: {}", v1);
}
```

```rust
 ❯ cargo run
v1: x: 3, y: 3 z: 3, v2: x: 1, y: 2 z: 3
v3: x: 4, y: 5 z: 6
v1 + v2: x: 4, y: 5 z: 6
v1 * 2: x: 8, y: 10 z: 12
```

Woohoo! But we still need to implement the unit vector, the dot and cross product.

## Unit vector, dot and cross products

Before we implement them, we first want to learn what these are first.    
The unit vector is a vector of length 1! Given any random vector, we can convert it into a
unit vector by first finding its length, and dividing each of its components by said
length! 

The dot product is a measure of "how similar" two angles are. You don't need to know why
we do this, but the general formula for two vectors `a` and `b` is `a.x * b.x + a.y * b.y
+ a.z * b.z`. The dot product is useful for determining things like intersections between
  a ray and an object, or the reflection of said ray (we go into this later!)

The cross product is a bit of an interesting function - given any two vectors, you can
find a third vector (in 3d space) which is right angled to both vectors. The formula is a
bit weird but it goes like this: For vectors `a` and `b`, with a resultant vector `c`:

```rust
c.x = a.y * b.z - a.z * b.y
c.y = a.z * b.x - a.x * b.z
c.z = a.x * b.y - a.y * b.x
```

We don't really have any traits to implement that would allow overloading here, so lets
just implement them as normal methods: `dot(), cross() and unit()`

```rust
impl Vec3 { 
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Vec3 {x, y, z}
    }

    pub fn mag(&self) -> f64 {
        let sum: f64 = (self.x * self.x + self.y * self.y + self.z * self.z) as f64;
        sum.sqrt()
    }

    pub fn dot(&self, b: Self) -> f64 {
        self.x * b.x + self.y * b.y + self.z * b.z
    }

    pub fn cross(&self, b: Self) -> Self {
        Self {
            x: self.y * b.z - self.z * b.y,
            y: self.z * b.x - self.x * b.z,
            z: self.x * b.y - self.y * b.x,
        }
    }

    pub fn unit(&self) -> Self {
        let mag = self.mag();
        Self {
            x: self.x / mag,
            y: self.y / mag,
            z: self.z / mag,
        }
    }
}
```

and once again, lets test them out:

```rust
fn main() {
    let v1 = Vec3::new(3.0, 3.0, 3.0);
    let v2 = Vec3::new(1.0, 2.0, 3.0);
    println!("v1: {} | v2: {}", v1, v2);

    let v3 = v1.cross(v2);
    println!("v3: {}", v3);
}
```

```rust
v1: x: 3, y: 3 z: 3 | v2: x: 1, y: 2 z: 3
v3: x: 3, y: -6 z: 3
```

Now, one cool thing about the dot product is that if two vectors are perpedicular to each
other (right angled), then the dot product would be zero! We can test out if our cross
product and dot product functions works by actually running `v3.dot(v1)` and checking if
its equal to `0`!

```rust
    println!("dot: {} {}", v3.dot(v1), v3.dot(v2));

> v1: x: 3, y: 3 z: 3 | v2: x: 1, y: 2 z: 3
v3: x: 3, y: -6 z: 3
dot: 0 0
```

everything seems to be in order! Lets move onto colour and rays!

## Colours and Rays


# Referneces
1. https://raytracing.github.io/books/RayTracingInOneWeekend.html     
2. https://docs.rs/bmp/latest/bmp/struct.Pixel.html    
3. https://doc.rust-lang.org/stable/std/convert/trait.TryInto.html#tymethod.try_into
4. https://doc.rust-lang.org/stable/std/convert/trait.TryFrom.html
5. https://doc.rust-lang.org/rust-by-example/conversion/from_into.html
