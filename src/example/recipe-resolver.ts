import { Recipe } from "./recipe-type";
import { RecipeInput } from "./recipe-input";
import { createRecipeSamples } from "./recipe-samples";
import { Arg, FieldResolver, Int, Mutation, Query, Resolver, ResolverInterface, Root } from "type-graphql";

@Resolver(of => Recipe)
export class RecipeResolver implements ResolverInterface<Recipe> {
  private readonly items: Recipe[] = createRecipeSamples();

  @Query(returns => Recipe, { nullable: true })
  async recipe(@Arg("title") title: string): Promise<Recipe | undefined> {
    return await this.items.find(recipe => recipe.title === title);
  }

  @Query(returns => [Recipe], { description: "Get all the recipes from around the world " })
  async recipes(): Promise<Recipe[]> {
    return await this.items;
  }

  @Mutation(() => Recipe)
  async addRecipe(@Arg("recipe") recipeInput: RecipeInput): Promise<Recipe> {
    const recipe = Object.assign(new Recipe(), {
      description: recipeInput.description,
      title: recipeInput.title,
      ratings: [],
      creationDate: new Date(),
    });
    await this.items.push(recipe);
    return recipe;
  }

  @FieldResolver()
  ratingsCount(
    @Root() recipe: Recipe,
    @Arg("minRate", type => Int, { defaultValue: 0.0 }) minRate: number,
  ): number {
    return recipe.ratings.filter(rating => rating >= minRate).length;
  }
}
