// Constrain the actual credit score to be above the queried credit score rating
// TODO: use real addresses
fn main(address : pub Field, level : pub Field, rating : Field) {
    let levelInt = level as u64;
    let ratingInt = rating as u64;

    assert(address == 1);
    assert(levelInt <= ratingInt);
}
